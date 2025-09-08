# Data Directory

This directory contains the source documents and data for populating the movie reviews database.

## Structure

```
data/
├── documents/          # PDF documents (.pdf files)
└── README.md          # This file
```

## Usage

1. **Add your PDF documents** to the `documents/` directory
2. **Run the population script** from the server directory:

```bash
# Dry run to see what would be processed
python populate_database.py --dry-run

# Clear database and populate with documents
python populate_database.py

# Only clear the database (don't populate)
python populate_database.py --clear-only
```

## How it works

- **Titles**: Extracted from filenames (e.g., `The-Essence-of-Cinematic.pdf` → "The Essence Of Cinematic")
- **Content**: Extracted from PDF document text
- **Tags**: Automatically inferred from content and title using film-related keywords
- **Document info**: Automatically set based on the uploaded file

## Supported file types

- `.pdf` (PDF documents)

## Notes

- The script will clear all existing data before populating
- Use `--dry-run` to preview what will be processed without making changes
- Document filenames should be descriptive as they become article titles
