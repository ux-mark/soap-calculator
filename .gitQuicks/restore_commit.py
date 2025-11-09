#!/usr/bin/env python3
"""
Git Commit Restore Tool
Helps find and restore previous commits in the current branch.
"""

import subprocess
import sys
import os
from datetime import datetime

def run_git_command(command):
    """Execute git command and return output."""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error: {result.stderr.strip()}")
            return None
        return result.stdout.strip()
    except Exception as e:
        print(f"Error executing command: {e}")
        return None

def check_git_repo():
    """Check if current directory is a git repository."""
    return run_git_command("git rev-parse --git-dir") is not None

def has_uncommitted_changes():
    """Check if there are uncommitted changes."""
    status = run_git_command("git status --porcelain")
    return status is not None and status != ""

def commit_current_changes():
    """Commit current changes with user-provided message."""
    print("\nUncommitted changes detected.")
    commit_msg = input("Enter commit message for current changes: ").strip()
    
    if not commit_msg:
        print("No commit message provided. Exiting.")
        return False
    
    # Add all changes
    if run_git_command("git add .") is None:
        return False
    
    # Commit changes
    commit_result = run_git_command(f'git commit -m "{commit_msg}"')
    if commit_result is None:
        return False
    
    print(f"✓ Changes committed: {commit_msg}")
    return True

def get_commit_history(limit=20):
    """Get recent commit history for current branch only."""
    current_branch = run_git_command("git branch --show-current")
    command = f'git log --oneline --reverse {current_branch} -n {limit}'
    return run_git_command(command)

def get_commit_details(commit_hash):
    """Get detailed information about a commit."""
    command = f'git show --stat {commit_hash}'
    return run_git_command(command)

def select_commit():
    """Display commits and let user select one."""
    print("\nRecent commits:")
    print("=" * 60)
    
    history = get_commit_history()
    if not history:
        print("No commit history found.")
        return None
    
    # Parse commits into list
    lines = history.split('\n')
    commits = []
    
    for i, line in enumerate(lines):
        print(f"{i + 1:2d}. {line}")
        # Extract commit hash (first 7 chars after any graph characters)
        parts = line.split()
        for part in parts:
            if len(part) >= 7 and all(c in '0123456789abcdef' for c in part[:7]):
                commits.append(part[:7])
                break
    
    print("=" * 60)
    
    while True:
        try:
            choice = input(f"\nSelect commit (1-{len(commits)}) or 'q' to quit: ").strip()
            
            if choice.lower() == 'q':
                return None
            
            choice_num = int(choice)
            if 1 <= choice_num <= len(commits):
                selected_hash = commits[choice_num - 1]
                
                # Show commit details for confirmation
                print(f"\nSelected commit: {selected_hash}")
                details = get_commit_details(selected_hash)
                if details:
                    print("\nCommit details:")
                    print("-" * 40)
                    print(details)
                    print("-" * 40)
                
                confirm = input("\nRestore this commit? (y/N): ").strip().lower()
                if confirm == 'y':
                    return selected_hash
                else:
                    continue
            else:
                print(f"Please enter a number between 1 and {len(commits)}")
                
        except ValueError:
            print("Please enter a valid number or 'q' to quit")
        except KeyboardInterrupt:
            print("\nOperation cancelled.")
            return None

def restore_commit(commit_hash):
    """Restore the selected commit."""
    print(f"\nRestoring commit {commit_hash}...")
    
    # Create a backup branch with current state
    current_branch = run_git_command("git branch --show-current")
    backup_branch = f"backup-{current_branch}-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    
    print(f"Creating backup branch: {backup_branch}")
    if run_git_command(f"git branch {backup_branch}") is None:
        print("Failed to create backup branch")
        return False
    
    # Reset to selected commit
    reset_result = run_git_command(f"git reset --hard {commit_hash}")
    if reset_result is None:
        print("Failed to reset to selected commit")
        return False
    
    print(f"✓ Successfully restored commit {commit_hash}")
    print(f"✓ Backup created at branch: {backup_branch}")
    print("\nCurrent working directory has been updated to match the selected commit.")
    
    return True

def main():
    """Main function."""
    print("Git Commit Restore Tool")
    print("=" * 30)
    
    # Check if we're in a git repository
    if not check_git_repo():
        print("Error: Not a git repository")
        sys.exit(1)
    
    # Check for uncommitted changes
    if has_uncommitted_changes():
        if not commit_current_changes():
            print("Cannot proceed without committing current changes.")
            sys.exit(1)
    else:
        print("✓ No uncommitted changes found")
    
    # Let user select commit
    selected_commit = select_commit()
    if not selected_commit:
        print("No commit selected. Exiting.")
        sys.exit(0)
    
    # Restore the selected commit
    if restore_commit(selected_commit):
        print("\n✓ Operation completed successfully!")
    else:
        print("\n✗ Operation failed!")
        sys.exit(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        sys.exit(1)