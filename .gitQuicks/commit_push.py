#!/usr/bin/env python3
import sys
import subprocess

def run_command(command, error_message):
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {error_message}")
        print(f"Command output: {result.stderr}")
        sys.exit(1)
    return result.stdout

def commit_and_push(commit_message):
    try:
        # Get current branch name
        current_branch = run_command(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            "Failed to get current branch name"
        ).strip()
        
        print(f"Working on branch: {current_branch}")
        
        # Add all files
        print("Adding all files...")
        run_command(
            ["git", "add", "*"],
            "Failed to add files"
        )
        
        # Commit with message
        print(f"Committing with message: '{commit_message}'")
        run_command(
            ["git", "commit", "-am", commit_message],
            "Failed to commit changes"
        )
        
        # Push to origin
        print(f"Pushing to origin/{current_branch}...")
        run_command(
            ["git", "push", "origin", current_branch],
            f"Failed to push to origin/{current_branch}"
        )
        
        print(f"Successfully committed and pushed to origin/{current_branch}")
        
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        commit_message = sys.argv[1]
    else:
        commit_message = input("Enter commit message: ")
    
    commit_and_push(commit_message)