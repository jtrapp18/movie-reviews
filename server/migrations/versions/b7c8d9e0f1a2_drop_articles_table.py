"""drop articles table and related indexes

Revision ID: b7c8d9e0f1a2
Revises: a1b2c3d4e5f6
Create Date: 2025-09-30 00:05:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b7c8d9e0f1a2'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade():
    # Drop indexes and FKs on articles if they exist
    try:
        with op.batch_alter_table('articles', schema=None) as batch_op:
            # Drop indexes (names must match previously created)
            try:
                batch_op.drop_index('ix_articles_director_id')
            except Exception:
                pass
            try:
                batch_op.drop_index('ix_articles_movie_id')
            except Exception:
                pass

            # Drop foreign keys
            try:
                batch_op.drop_constraint(batch_op.f('fk_articles_director_id_directors'), type_='foreignkey')
            except Exception:
                pass
            try:
                batch_op.drop_constraint(batch_op.f('fk_articles_movie_id_movies'), type_='foreignkey')
            except Exception:
                pass
    except Exception:
        # Table may not exist; skip
        pass

    # Drop association table article_tags if present
    try:
        op.drop_table('article_tags')
    except Exception:
        pass

    # Finally, drop the articles table
    try:
        op.drop_table('articles')
    except Exception:
        pass


def downgrade():
    # Recreate minimal articles table (without tags) to allow downgrade
    op.create_table(
        'articles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('date_added', sa.Date(), nullable=False),
        sa.Column('movie_id', sa.Integer(), nullable=True),
        sa.Column('director_id', sa.Integer(), nullable=True),
        sa.Column('has_document', sa.Boolean(), nullable=True),
        sa.Column('document_filename', sa.String(length=255), nullable=True),
        sa.Column('document_path', sa.String(length=500), nullable=True),
        sa.Column('document_type', sa.String(length=10), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Recreate indexes and FKs
    with op.batch_alter_table('articles', schema=None) as batch_op:
        try:
            batch_op.create_foreign_key(batch_op.f('fk_articles_movie_id_movies'), 'movies', ['movie_id'], ['id'])
        except Exception:
            pass
        try:
            batch_op.create_foreign_key(batch_op.f('fk_articles_director_id_directors'), 'directors', ['director_id'], ['id'])
        except Exception:
            pass
        try:
            batch_op.create_index('ix_articles_movie_id', ['movie_id'], unique=False)
        except Exception:
            pass
        try:
            batch_op.create_index('ix_articles_director_id', ['director_id'], unique=False)
        except Exception:
            pass

