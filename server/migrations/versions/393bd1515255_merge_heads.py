"""merge_heads

Revision ID: 393bd1515255
Revises: b7c8d9e0f1a2, bebcf6ae4f08
Create Date: 2025-09-30 07:30:00.022239

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "393bd1515255"
down_revision = ("b7c8d9e0f1a2", "bebcf6ae4f08")
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
