"""Add search optimization indexes

Revision ID: add_search_indexes
Revises: dba6de90e194
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_search_indexes'
down_revision = 'dba6de90e194'
branch_labels = None
depends_on = None


def upgrade():
    """Add search optimization indexes."""
    # Enable trigram extension
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
    
    # Movie indexes
    op.create_index('idx_movie_title_gin', 'movies', ['title'], 
                   postgresql_using='gin', postgresql_ops={'title': 'gin_trgm_ops'})
    
    op.create_index('idx_movie_original_title_gin', 'movies', ['original_title'], 
                   postgresql_using='gin', postgresql_ops={'original_title': 'gin_trgm_ops'})
    
    op.create_index('idx_movie_overview_gin', 'movies', ['overview'], 
                   postgresql_using='gin', postgresql_ops={'overview': 'gin_trgm_ops'})
    
    op.create_index('idx_movie_external_id', 'movies', ['external_id'])
    op.create_index('idx_movie_release_date', 'movies', ['release_date'])
    
    # Review indexes
    op.create_index('idx_review_title_gin', 'reviews', ['title'], 
                   postgresql_using='gin', postgresql_ops={'title': 'gin_trgm_ops'})
    
    op.create_index('idx_review_text_gin', 'reviews', ['review_text'], 
                   postgresql_using='gin', postgresql_ops={'review_text': 'gin_trgm_ops'})
    
    op.create_index('idx_review_description_gin', 'reviews', ['description'], 
                   postgresql_using='gin', postgresql_ops={'description': 'gin_trgm_ops'})
    
    op.create_index('idx_review_movie_id', 'reviews', ['movie_id'])
    op.create_index('idx_review_content_type', 'reviews', ['content_type'])
    op.create_index('idx_review_date_added', 'reviews', ['date_added'])
    op.create_index('idx_review_rating', 'reviews', ['rating'])
    
    # Tag indexes
    op.create_index('idx_tag_name_gin', 'tags', ['name'], 
                   postgresql_using='gin', postgresql_ops={'name': 'gin_trgm_ops'})


def downgrade():
    """Remove search optimization indexes."""
    # Drop indexes
    op.drop_index('idx_tag_name_gin', table_name='tags')
    op.drop_index('idx_review_rating', table_name='reviews')
    op.drop_index('idx_review_date_added', table_name='reviews')
    op.drop_index('idx_review_content_type', table_name='reviews')
    op.drop_index('idx_review_movie_id', table_name='reviews')
    op.drop_index('idx_review_description_gin', table_name='reviews')
    op.drop_index('idx_review_text_gin', table_name='reviews')
    op.drop_index('idx_review_title_gin', table_name='reviews')
    op.drop_index('idx_movie_release_date', table_name='movies')
    op.drop_index('idx_movie_external_id', table_name='movies')
    op.drop_index('idx_movie_overview_gin', table_name='movies')
    op.drop_index('idx_movie_original_title_gin', table_name='movies')
    op.drop_index('idx_movie_title_gin', table_name='movies')
    
    # Note: We don't drop the pg_trgm extension as it might be used elsewhere
