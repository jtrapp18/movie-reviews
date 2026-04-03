"""adding origin country to movie model

Revision ID: fb38617af53a
Revises: 458520e8f57c
Create Date: 2026-04-03 08:16:14.780469

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "fb38617af53a"
down_revision = "458520e8f57c"
branch_labels = None
depends_on = None


def upgrade():
    # Nullable until backfill; no DEFAULT needed for existing rows.
    op.add_column(
        "movies",
        sa.Column("primary_origin_country", sa.String(length=10), nullable=True),
    )


def downgrade():
    op.drop_column("movies", "primary_origin_country")
