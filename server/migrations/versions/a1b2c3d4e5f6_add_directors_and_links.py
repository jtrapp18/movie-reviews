"""add directors and links

Revision ID: a1b2c3d4e5f6
Revises: 2f6909619958
Create Date: 2025-09-30 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "a1b2c3d4e5f6"
down_revision = "2f6909619958"
branch_labels = None
depends_on = None


def upgrade():
    # Create directors table only if it doesn't already exist
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table("directors"):
        op.create_table(
            "directors",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("cover_photo", sa.String(length=500), nullable=False),
            sa.Column("biography", sa.Text(), nullable=True),
            sa.PrimaryKeyConstraint("id"),
        )

        # Index on director name for faster lookups
        op.create_index("ix_directors_name", "directors", ["name"], unique=False)

    # Movies: add director_id and FK (only if missing)
    movie_columns = [c["name"] for c in inspector.get_columns("movies")]
    movie_indexes = [ix["name"] for ix in inspector.get_indexes("movies")]
    movie_fks = [fk["name"] for fk in inspector.get_foreign_keys("movies")]

    with op.batch_alter_table("movies", schema=None) as batch_op:
        if "director_id" not in movie_columns:
            batch_op.add_column(sa.Column("director_id", sa.Integer(), nullable=True))
        # Only create FK if it doesn't already exist
        if "fk_movies_director_id_directors" not in movie_fks:
            batch_op.create_foreign_key(
                batch_op.f("fk_movies_director_id_directors"),
                "directors",
                ["director_id"],
                ["id"],
            )

        if "ix_movies_director_id" not in movie_indexes:
            batch_op.create_index(
                "ix_movies_director_id", ["director_id"], unique=False
            )

    # Reviews: add director_id and FK (only if missing)
    review_columns = [c["name"] for c in inspector.get_columns("reviews")]
    review_indexes = [ix["name"] for ix in inspector.get_indexes("reviews")]
    review_fks = [fk["name"] for fk in inspector.get_foreign_keys("reviews")]

    with op.batch_alter_table("reviews", schema=None) as batch_op:
        if "director_id" not in review_columns:
            batch_op.add_column(sa.Column("director_id", sa.Integer(), nullable=True))

        if "fk_reviews_director_id_directors" not in review_fks:
            batch_op.create_foreign_key(
                batch_op.f("fk_reviews_director_id_directors"),
                "directors",
                ["director_id"],
                ["id"],
            )

        if "ix_reviews_director_id" not in review_indexes:
            batch_op.create_index(
                "ix_reviews_director_id", ["director_id"], unique=False
            )

    # Articles: add movie_id and director_id and FKs (if table exists)
    # Note: If your DB doesn't have 'articles' yet, ensure a prior migration creates it.
    if inspector.has_table("articles"):
        article_columns = [c["name"] for c in inspector.get_columns("articles")]
        article_indexes = [ix["name"] for ix in inspector.get_indexes("articles")]
        article_fks = [fk["name"] for fk in inspector.get_foreign_keys("articles")]

        with op.batch_alter_table("articles", schema=None) as batch_op:
            if "movie_id" not in article_columns:
                batch_op.add_column(sa.Column("movie_id", sa.Integer(), nullable=True))
            if "director_id" not in article_columns:
                batch_op.add_column(
                    sa.Column("director_id", sa.Integer(), nullable=True)
                )

            if "fk_articles_movie_id_movies" not in article_fks:
                batch_op.create_foreign_key(
                    batch_op.f("fk_articles_movie_id_movies"),
                    "movies",
                    ["movie_id"],
                    ["id"],
                )
            if "fk_articles_director_id_directors" not in article_fks:
                batch_op.create_foreign_key(
                    batch_op.f("fk_articles_director_id_directors"),
                    "directors",
                    ["director_id"],
                    ["id"],
                )

            if "ix_articles_movie_id" not in article_indexes:
                batch_op.create_index(
                    "ix_articles_movie_id", ["movie_id"], unique=False
                )
            if "ix_articles_director_id" not in article_indexes:
                batch_op.create_index(
                    "ix_articles_director_id", ["director_id"], unique=False
                )


def downgrade():
    # Articles: drop indexes, FKs, and columns if present
    try:
        with op.batch_alter_table("articles", schema=None) as batch_op:
            batch_op.drop_index("ix_articles_director_id")
            batch_op.drop_index("ix_articles_movie_id")
            batch_op.drop_constraint(
                batch_op.f("fk_articles_director_id_directors"), type_="foreignkey"
            )
            batch_op.drop_constraint(
                batch_op.f("fk_articles_movie_id_movies"), type_="foreignkey"
            )
            batch_op.drop_column("director_id")
            batch_op.drop_column("movie_id")
    except Exception:
        pass

    # Reviews: drop director_id
    with op.batch_alter_table("reviews", schema=None) as batch_op:
        batch_op.drop_index("ix_reviews_director_id")
        batch_op.drop_constraint(
            batch_op.f("fk_reviews_director_id_directors"), type_="foreignkey"
        )
        batch_op.drop_column("director_id")

    # Movies: drop director_id
    with op.batch_alter_table("movies", schema=None) as batch_op:
        batch_op.drop_index("ix_movies_director_id")
        batch_op.drop_constraint(
            batch_op.f("fk_movies_director_id_directors"), type_="foreignkey"
        )
        batch_op.drop_column("director_id")

    # Drop directors table and index
    op.drop_index("ix_directors_name", table_name="directors")
    op.drop_table("directors")
