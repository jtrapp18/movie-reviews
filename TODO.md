# Movie Reviews Project - Todo List

## Current Tasks

### 🎬 Movie Pages
1. [✅] **Add back the search bar to the movies pages** - Restore movie API search functionality that was accidentally deleted (Fixed: removed duplicate search bars, added proper search to SearchMovies page)
2. [✅] **Organize movie search page into categories** - Improve the structure and organization of search results (Completed: Added swimlanes by genre with horizontal scrolling)
3. [✅] **Fix duplicate movies in swimlanes** - Fix search such that it isn't repeating the same movies in every lane (Completed: Added Netflix-style hybrid with search grid)
4. [✅] **Fix footer in search movie page** - Ensure footer stays at the bottom of the search movies page (Completed: Fixed layout with proper flex positioning)

### 📝 Content Pages
5. [✅] **Format the articles page** - Improve the visual presentation and layout
6. [✅] **Format the review page** - Enhance the review page design and user experience
7. [✅] **Add tagging functionality to review page** - Implement a tagging system for reviews
8. [✅ ] **Possibly merge review and articles components** - Consider consolidating similar functionality
9. [ ] **Add swimlanes for articles based on tags** - Create swimlanes for articles organized by tags (similar to movie genre swimlanes)
10. [✅] **Reformat document reader pages** - Improve the visual presentation and layout of document viewing/reading pages

### 🛠️ Functionality & Tools
10. [✅] **Remove PDF tools from viewer** - Clean up unnecessary PDF-related features
11. [ ] **Add functionality to upload or seed multiple articles from the UI** - Enable bulk article management
12. [✅] **Test login functionality** - Verify authentication is working properly
13. [ ] **Review search functionality** - Comprehensive review of search across titles, tags, and descriptions
14. [✅] **Fix duplicate articles bug** - Articles with same title/ID appearing multiple times in search results (Fixed: Slick carousel was creating clones for single items)
15. [✅] **DRY up duplicate code** - Created shared components: PageContainer (Completed: Consolidated duplicate styling, removed over-engineered components)
16. [✅] **Fix articles carousel autoplay** - Articles carousel not auto-scrolling despite correct settings (6 articles, autoplay enabled) (Fixed: Working now)
17. [✅] **Fix add article button visibility** - Add article button not showing on articles page (Fixed: Moved button after carousel, fixed overflow issue)
18. [ ] **Fix intermittent file upload errors** - File uploads for reviews sometimes fail, doesn't happen every time (Bug reported)

### 🔍 Search Performance Optimization
19. [ ] **Optimize unified search endpoint performance** - Current search is terribly slow, needs advanced optimization techniques

## 🔍 Search Performance Optimization Strategy

### Current Performance Issues Identified:
- **Multiple Complex JOINs**: `Movie JOIN Review JOIN Tag` creates expensive operations
- **ILIKE with Wildcards**: `%search_query%` prevents index usage
- **N+1 Query Problem**: `.to_dict()` serialization likely triggers additional queries
- **No Database Indexes**: No indexes on searchable fields
- **Full Table Scans**: Searching across all movies/reviews without optimization

### Implementation Plan (Priority Order):

#### Phase 1: Database Optimization (Immediate Impact - 30-50% improvement)
**Status:** [ ] Not Started

**Tasks:**
- [ ] **Add strategic database indexes** - Create GIN indexes for text search fields
  ```python
  # Text search indexes (PostgreSQL GIN with trigram)
  Index('idx_movie_title_gin', Movie.title, postgresql_using='gin', postgresql_ops={'title': 'gin_trgm_ops'})
  Index('idx_review_text_gin', Review.review_text, postgresql_using='gin', postgresql_ops={'review_text': 'gin_trgm_ops'})
  Index('idx_review_title_gin', Review.title, postgresql_using='gin', postgresql_ops={'title': 'gin_trgm_ops'})
  Index('idx_tag_name_gin', Tag.name, postgresql_using='gin', postgresql_ops={'name': 'gin_trgm_ops'})
  
  # Foreign key indexes (if not already present)
  Index('idx_review_movie_id', Review.movie_id)
  Index('idx_review_content_type', Review.content_type)
  ```

- [ ] **Optimize SQL queries** - Replace complex JOINs with subqueries and add LIMIT clauses
- [ ] **Enable PostgreSQL trigram extension** - `CREATE EXTENSION IF NOT EXISTS pg_trgm;`

#### Phase 2: Query Optimization (20-30% improvement)
**Status:** [ ] Not Started

**Tasks:**
- [ ] **Reduce N+1 queries** - Use `joinedload()` or `select_related()` for relationships
- [ ] **Add query result limits** - Prevent large result sets with pagination
- [ ] **Use EXISTS instead of JOIN** - Where possible to reduce complexity
- [ ] **Optimize serialization** - Minimize `.to_dict()` calls and use bulk operations

#### Phase 3: Full-Text Search Implementation (50-80% improvement)
**Status:** [ ] Not Started

**Tasks:**
- [ ] **Add full-text search columns** - Create TSVECTOR columns for Movie and Review
  ```python
  from sqlalchemy.dialects.postgresql import TSVECTOR
  
  class Movie(db.Model):
      search_vector = Column(TSVECTOR)
  
  class Review(db.Model):
      search_vector = Column(TSVECTOR)
  ```

- [ ] **Create GIN indexes on search vectors**
  ```python
  Index('idx_movie_search_vector', Movie.search_vector, postgresql_using='gin')
  Index('idx_review_search_vector', Review.search_vector, postgresql_using='gin')
  ```

- [ ] **Implement search ranking** - Use `ts_rank()` for relevance scoring
- [ ] **Add search vector population** - Auto-populate vectors on data changes

#### Phase 4: Caching & Performance (90%+ improvement for repeated searches)
**Status:** [ ] Not Started

**Tasks:**
- [ ] **Implement Redis caching layer** - Cache search results with TTL
  ```python
  import redis
  import json
  import hashlib
  
  def cached_search(search_query, cache_ttl=300):  # 5 minutes
      cache_key = f"search:{hashlib.md5(search_query.encode()).hexdigest()}"
      # Implementation details...
  ```

- [ ] **Add query result pagination** - Limit results per page (20 items max)
- [ ] **Implement search debouncing** - Prevent excessive API calls from rapid typing

#### Phase 5: Advanced Techniques (Future Enhancement)
**Status:** [ ] Not Started

**Tasks:**
- [ ] **Async search with parallel processing** - Run movie and article searches concurrently
- [ ] **Search analytics** - Track popular searches and optimize accordingly
- [ ] **Search suggestions** - Auto-complete based on existing data
- [ ] **Search result highlighting** - Highlight matching terms in results

### Performance Targets:
- **Current**: ~2-5 seconds for complex searches
- **Phase 1**: ~1-2 seconds (30-50% improvement)
- **Phase 2**: ~0.5-1 second (20-30% improvement)
- **Phase 3**: ~0.2-0.5 seconds (50-80% improvement)
- **Phase 4**: ~0.1 seconds for cached searches (90%+ improvement)

### Implementation Notes:
- Start with Phase 1 (database indexes) for immediate impact
- Measure performance at each phase to validate improvements
- Consider PostgreSQL-specific optimizations (GIN indexes, trigram extension)
- Implement caching last as it requires additional infrastructure (Redis)

## 🚀 Document Upload S3 Migration Strategy

### Phase 1: S3-Only Implementation (Current Focus)
**Goal:** Replace temp file storage with persistent S3 storage for production deployment

**Status:** [🔄] In Progress

**Tasks:**
- [✅] Set up Railway MinIO service
- [✅] Create S3 client wrapper with boto3
- [✅] Update document processor to use S3 storage
- [✅] Modify API endpoints to serve from S3
- [✅] Test S3 connection and bucket creation
- [ ] Deploy and test document upload functionality
- [ ] Verify file persistence across deployments
- [ ] Test download and preview functionality

**Benefits:**
- ✅ Files persist across Railway deployments
- ✅ No more temp file cleanup issues
- ✅ Production-ready and reliable
- ✅ Simple implementation with minimal complexity

### Phase 2: Smart Caching (Future Enhancement)
**Goal:** Add local caching layer for improved performance on frequently accessed files

**Status:** [ ] Not Started

**Tasks:**
- [ ] Implement local temp file caching
- [ ] Add cache TTL and invalidation logic
- [ ] Create cache cleanup on startup
- [ ] Add fallback to S3 on cache miss
- [ ] Monitor cache hit rates and performance

**When to implement:**
- High-traffic documents (same file accessed frequently)
- Large files (>50MB) causing slow S3 downloads
- Performance issues identified in production

**Implementation Strategy:**
```python
# Pseudo-code for smart caching
def get_document(review_id):
    # Check local cache first
    if file_exists_in_cache(review_id):
        if cache_is_fresh(review_id):
            return serve_from_cache(review_id)
        else:
            delete_from_cache(review_id)
    
    # Download from S3 and cache
    s3_file = download_from_s3(review_id)
    cache_file_locally(review_id, s3_file)
    return serve_from_cache(review_id)
```

### Technical Details
- **Storage:** S3 object keys stored in existing `document_path` field
- **Path Structure:** `uploads/documents/{uuid}_{filename}`
- **Database:** No schema changes required
- **Frontend:** No changes needed to DocumentUpload.jsx
- **Cost:** Railway MinIO at $0.25/GB/month (predictable pricing)

## Status Legend
- [ ] Pending
- [🔄] In Progress
- [✅] Completed
- [❌] Cancelled

## Notes
- Last updated: $(date)
- This file can be updated as tasks are completed or new ones are added
