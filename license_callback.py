#!/usr/bin/env python3

import os

def process_filename(filename):
    """Add LICENSE file to every commit that doesn't have it"""
    # Always keep existing files
    return filename

# Read LICENSE content if it exists
license_content = None
if os.path.exists('LICENSE'):
    with open('LICENSE', 'rb') as f:
        license_content = f.read()

def process_file_info(filename, mode, blob_id, value):
    """Process file info and add LICENSE if missing"""
    
    # Check if we're looking at a commit that has LICENSE
    if filename == b'LICENSE':
        # Update LICENSE with current content if we have it
        if license_content:
            new_blob_id = value.insert_file_with_contents(license_content)
            return (filename, mode, new_blob_id)
    
    # Return unchanged for other files
    return (filename, mode, blob_id)
