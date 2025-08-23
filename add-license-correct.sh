#!/bin/bash

# Script to add LICENSE file to every commit using git-filter-repo command-line tool
# This is the CORRECT approach for macOS with brew-installed git-filter-repo

echo "Adding LICENSE to every commit in git history using git-filter-repo command-line tool..."

# Verify git-filter-repo is available
if ! command -v git-filter-repo &> /dev/null; then
    echo "Error: git-filter-repo not found. Install with: brew install git-filter-repo"
    exit 1
fi

# Verify LICENSE file exists
if [[ ! -f "LICENSE" ]]; then
    echo "Error: LICENSE file not found in current directory"
    exit 1
fi

echo "LICENSE file found, proceeding with git history rewrite..."

# Use git-filter-repo to add LICENSE to every commit
# The --force flag overwrites the existing history
git-filter-repo --force --commit-callback '
import os

def commit_callback(commit, metadata):
    """Add LICENSE file to every commit"""
    
    # Read LICENSE content
    if os.path.exists("LICENSE"):
        with open("LICENSE", "rb") as f:
            license_content = f.read()
        
        # Check if LICENSE already exists in this commit
        has_license = any(change.filename == b"LICENSE" for change in commit.file_changes)
        
        if not has_license:
            # Add LICENSE file to this commit
            from git_filter_repo import FileChange, hash_bytes
            license_change = FileChange(
                b"M",  # Mode: modify/add
                b"LICENSE",  # Filename
                hash_bytes(license_content),  # Content hash
                mode=b"100644"  # File permissions
            )
            commit.file_changes.append(license_change)
'

echo "git-filter-repo completed."
echo "Verifying LICENSE is now in all commits..."

# Check first commit
FIRST_COMMIT=$(git rev-list --max-parents=0 HEAD)
echo "First commit: $FIRST_COMMIT"
git show --name-only $FIRST_COMMIT | grep LICENSE && echo "✅ LICENSE found in first commit" || echo "❌ LICENSE not found in first commit"

# Check latest commit  
echo "Latest commit:"
git show --name-only HEAD | grep LICENSE && echo "✅ LICENSE found in latest commit" || echo "❌ LICENSE not found in latest commit"

echo "LICENSE addition process complete."
