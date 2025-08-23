#!/usr/bin/env python3
"""
Add LICENSE file to every commit in git history using git-filter-repo
"""
import os
import git_filter_repo as fr

# Read the LICENSE file content
def get_license_content():
    with open('LICENSE', 'rb') as f:
        return f.read()

def add_license_to_commit(commit, metadata):
    """Add LICENSE file to every commit"""
    license_content = get_license_content()
    
    # Create a LICENSE file change for this commit
    license_change = fr.FileChange(
        b'M',  # Modify (or add if it doesn't exist)
        b'LICENSE',  # filename
        fr.hash_bytes(license_content),  # file hash
        mode=b'100644'  # regular file mode
    )
    
    # Add the LICENSE change to this commit's file changes
    commit.file_changes.append(license_change)

def main():
    # Add license content to the blob filter
    license_content = get_license_content()
    
    args = fr.FilteringOptions.parse_args(['--force'])
    
    filter = fr.RepoFilter(
        args,
        commit_callback=add_license_to_commit,
        blob_callback=lambda blob, metadata: None
    )
    
    # Add the LICENSE blob to the filter
    license_blob = fr.Blob(license_content)
    filter.insert(license_blob)
    
    filter.run()

if __name__ == '__main__':
    main()
