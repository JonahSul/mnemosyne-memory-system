#!/bin/bash

# Script to add LICENSE file to every commit in git history
# This ensures every commit has the LICENSE for theft protection

echo "Adding LICENSE file to every commit in git history..."

# Create a temporary script for git-filter-repo
cat > /tmp/add-license-callback.py << 'EOF'
#!/usr/bin/env python3
import git_filter_repo as fr
import os

# Read LICENSE content once
with open('LICENSE', 'rb') as f:
    LICENSE_CONTENT = f.read()

def add_license_callback(commit, metadata):
    """Add LICENSE file to every commit"""
    
    # Create LICENSE file change
    license_change = fr.FileChange(
        b'M',  # Mode: modify/add
        b'LICENSE',  # Filename
        fr.hash_bytes(LICENSE_CONTENT),  # Content hash
        mode=b'100644'  # File permissions
    )
    
    # Check if LICENSE already exists in this commit
    has_license = any(change.filename == b'LICENSE' for change in commit.file_changes)
    
    if not has_license:
        # Add LICENSE to this commit's file changes
        commit.file_changes.append(license_change)

# Register the callback
args = fr.FilteringOptions.parse_args(['--force'])
filter = fr.RepoFilter(
    args,
    commit_callback=add_license_callback
)

# Add LICENSE blob to the repo
license_blob = fr.Blob(LICENSE_CONTENT)
filter.insert(license_blob)

filter.run()
EOF

# Make the callback script executable
chmod +x /tmp/add-license-callback.py

# Run git-filter-repo with the callback
echo "Running git-filter-repo to add LICENSE to all commits..."
python3 /tmp/add-license-callback.py

# Clean up
rm /tmp/add-license-callback.py

echo "LICENSE has been added to all commits in the repository history."
echo "Verifying LICENSE is in the first commit..."
git show --name-only $(git rev-list --max-parents=0 HEAD) | grep LICENSE
