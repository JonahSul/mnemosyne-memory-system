#!/bin/bash

# First, let's check git status and recover if needed
echo "Checking git status..."
git status

# Create a Python callback file for git-filter-repo
cat > /tmp/add_license_callback.py << 'EOF'
import os

# Read LICENSE content
license_content = None
if os.path.exists("LICENSE"):
    with open("LICENSE", "rb") as f:
        license_content = f.read()

def add_license_to_commit(commit, metadata):
    if license_content:
        # Check if LICENSE already exists in this commit
        has_license = any(change.filename == b'LICENSE' for change in commit.file_changes)
        
        if not has_license:
            # Add LICENSE file to this commit
            from git_filter_repo import FileChange
            commit.file_changes.append(FileChange(b'A', b'LICENSE', license_content))
EOF

echo "Running git-filter-repo to add LICENSE to all commits..."
git-filter-repo --force --commit-callback /tmp/add_license_callback.py

echo "Cleaning up..."
rm /tmp/add_license_callback.py

echo "Done! LICENSE should now be in all commits."
