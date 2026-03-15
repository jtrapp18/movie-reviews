"""Add external_id to directors table

Revision ID: add_external_id_to_directors
Revises: 393bd1515255
Create Date: 2026-03-07 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "add_external_id_to_directors"
down_revision = "393bd1515255"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table("directors"):
        columns = [c["name"] for c in inspector.get_columns("directors")]
        if "external_id" not in columns:
            op.add_column(
                "directors", sa.Column("external_id", sa.Integer(), nullable=True)
            )
            op.create_index(
                "ix_directors_external_id", "directors", ["external_id"], unique=True
            )


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table("directors"):
        columns = [c["name"] for c in inspector.get_columns("directors")]
        if "external_id" in columns:
            op.drop_index("ix_directors_external_id", table_name="directors")
            op.drop_column("directors", "external_id")
