#!/usr/bin/env python3

def commit_callback(commit):
    """Add LICENSE file to every commit"""
    
    # Read LICENSE content
    with open('LICENSE', 'rb') as f:
        license_content = f.read()
    
    # Check if LICENSE already exists in this commit
    has_license = any(change.filename == b'LICENSE' for change in commit.file_changes)
    
    if not has_license:
        # Import required classes at the point of use
        from git_filter_repo import FileChange, hash_bytes
        
        # Create LICENSE file change
        license_change = FileChange(
            b'M',  # Mode: modify/add
            b'LICENSE',  # Filename  
            hash_bytes(license_content),  # Content hash
            mode=b'100644'  # File permissions
        )
        
        # Add to commit's file changes
        commit.file_changes.append(license_change)
