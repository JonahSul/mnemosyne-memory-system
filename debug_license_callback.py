#!/usr/bin/env python3

def commit_callback(commit):
    """Debug callback to test if it's even being called"""
    
    # Debug output to verify callback is running
    print(f"CALLBACK DEBUG: Processing commit {commit.original_id}")
    print(f"CALLBACK DEBUG: Commit has {len(commit.file_changes)} file changes")
    
    # List existing files in this commit
    for change in commit.file_changes:
        print(f"CALLBACK DEBUG: File in commit: {change.filename}")
    
    # Check if LICENSE exists
    has_license = any(change.filename == b'LICENSE' for change in commit.file_changes)
    print(f"CALLBACK DEBUG: LICENSE exists in commit: {has_license}")
    
    if not has_license:
        print("CALLBACK DEBUG: LICENSE missing, attempting to add...")
        
        # Try to read LICENSE and add it
        try:
            with open('LICENSE', 'rb') as f:
                license_content = f.read()
            print(f"CALLBACK DEBUG: Read LICENSE file, {len(license_content)} bytes")
            
            # Import required classes
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
            print("CALLBACK DEBUG: Added LICENSE to commit file changes")
            
        except Exception as e:
            print(f"CALLBACK DEBUG: Error adding LICENSE: {e}")
    
    print("CALLBACK DEBUG: Callback complete\n")
