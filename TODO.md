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
