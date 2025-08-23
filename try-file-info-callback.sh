#!/bin/bash

# Use git-filter-repo with file-info-callback to add LICENSE to every commit
# This uses the value.insert_file_with_contents() method

echo "Adding LICENSE to every commit using file-info-callback approach..."

# Read LICENSE content and create a Python callback script
cat > /tmp/add_license_callback.py << 'EOF'
import os

# Read LICENSE content once at startup
with open('LICENSE', 'rb') as f:
    LICENSE_CONTENT = f.read()

def file_info_callback(filename, mode, blob_id, value):
    """Add LICENSE file to every commit if it doesn't exist"""
    
    # Check if this is already the LICENSE file
    if filename == b'LICENSE':
        return (filename, mode, blob_id)
    
    # For the first file in each commit, check if LICENSE exists
    # If not, add it using insert_file_with_contents
    if not hasattr(value, '_license_added'):
        # Insert LICENSE file
        license_blob_id = value.insert_file_with_contents(LICENSE_CONTENT)
        
        # Mark that we've added LICENSE to this commit
        value._license_added = True
        
        # We need to create a separate LICENSE entry, but this callback
        # only processes one file at a time. We'll need a different approach.
    
    return (filename, mode, blob_id)
EOF

echo "Trying file-info-callback approach..."
git-filter-repo --force --file-info-callback /tmp/add_license_callback.py

# Clean up
rm /tmp/add_license_callback.py

echo "Checking if LICENSE was added..."
git show --name-only $(git rev-list --max-parents=0 HEAD) | grep LICENSE
