#!/bin/bash

# Add LICENSE file to all commits in the repository
# This script uses git-filter-repo to add the LICENSE file to every commit

echo "Adding LICENSE file to all commits..."

# Create a temporary script for git-filter-repo
cat > /tmp/add_license.py << 'EOF'
#!/usr/bin/env python3

import os
import sys

def add_license_callback(commit, metadata):
    """Add LICENSE file to every commit"""
    
    # Read the LICENSE file content
    license_path = "LICENSE"
    if os.path.exists(license_path):
        with open(license_path, 'rb') as f:
            license_content = f.read()
        
        # Check if LICENSE already exists in this commit
        has_license = any(change.filename == b'LICENSE' for change in commit.file_changes)
        
        if not has_license:
            # Add LICENSE file to this commit
            from git_filter_repo import FileChange
            commit.file_changes.append(FileChange(b'A', b'LICENSE', license_content))

# This will be called by git-filter-repo
EOF

chmod +x /tmp/add_license.py

# Run git-filter-repo with our callback
git filter-repo --force --commit-callback /tmp/add_license.py

echo "LICENSE file added to all commits!"

# Clean up
rm /tmp/add_license.py
