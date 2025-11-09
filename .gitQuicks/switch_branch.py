#!/usr/bin/env python3
import sys
import subprocess
import os
import argparse

def run_command(command, error_message, check_error=True):
    result = subprocess.run(command, capture_output=True, text=True)
    if check_error and result.returncode != 0:
        print(f"Error: {error_message}")
        print(f"Command output: {result.stderr}")
        sys.exit(1)
    return result.stdout

def switch_branch(new_branch, save_changes=True):
    try:
        print(f"Attempting to switch to branch: {new_branch}")
        
        # Check if remote exists
        remote_check = run_command(
            ["git", "ls-remote", "--heads", "origin", new_branch],
            f"Failed to check remote branches",
            check_error=False
        )
        
        have_stashed = False
        # Handle changes on current branch
        if save_changes:
            # Save current work
            print("Saving current work...")
            run_command(["git", "add", "."], "Failed to stage changes")
            
            # Only commit if there are changes
            status = run_command(["git", "status", "--porcelain"], "Failed to check status")
            if status.strip():
                run_command(
                    ["git", "commit", "-m", f"Save work before switching to {new_branch}"],
                    "Failed to commit changes"
                )
                print("Changes committed successfully")
            else:
                print("No changes to commit")
        else:
            # Check if there are uncommitted changes
            status = run_command(["git", "status", "--porcelain"], "Failed to check status")
            if status.strip():
                # Simply stash without asking when using -n flag
                print("Transferring uncommitted changes to new branch...")
                run_command(
                    ["git", "stash", "push", "-m", f"Changes to transfer to {new_branch}"],
                    "Failed to stash changes"
                )
                print("Changes stashed successfully")
                have_stashed = True
        
        # First try to switch to local branch if it exists
        if subprocess.run(["git", "show-ref", "--verify", "--quiet", f"refs/heads/{new_branch}"]).returncode == 0:
            # Local branch exists
            print(f"Switching to existing local branch {new_branch}...")
            run_command(["git", "checkout", new_branch], f"Failed to checkout branch {new_branch}")
            
            # Pull latest changes if remote exists
            if remote_check.strip():
                print(f"Pulling latest changes from origin/{new_branch}...")
                run_command(
                    ["git", "pull", "origin", new_branch],
                    f"Failed to pull latest changes from origin/{new_branch}",
                    check_error=False
                )
        elif remote_check.strip():
            # Remote exists but local doesn't
            print(f"Creating local branch tracking remote origin/{new_branch}...")
            run_command(
                ["git", "checkout", "-b", new_branch, f"origin/{new_branch}"],
                f"Failed to checkout branch {new_branch}"
            )
        else:
            # Neither local nor remote branch exists, create new branch
            print(f"Creating new branch {new_branch}...")
            run_command(
                ["git", "checkout", "-b", new_branch],
                f"Failed to create new branch {new_branch}"
            )
            
            # Push to create remote branch
            print(f"Pushing new branch to remote...")
            run_command(
                ["git", "push", "-u", "origin", new_branch],
                f"Failed to push new branch to remote"
            )
        
        # Apply stashed changes automatically when using -n flag
        if have_stashed:
            print("Applying changes to new branch...")
            run_command(
                ["git", "stash", "apply", "stash@{0}"],
                "Failed to apply stashed changes"
            )
            run_command(["git", "stash", "drop", "stash@{0}"], "Failed to drop stash", check_error=False)
            print("Changes transferred to new branch")
        
        print(f"Successfully switched to {new_branch}")
            
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    # Set up argument parser
    parser = argparse.ArgumentParser(description="Switch to a Git branch with options to save current work")
    parser.add_argument("branch", nargs="?", help="Name of the branch to switch to")
    parser.add_argument("-n", "--new-only", action="store_true", help="Don't save changes on current branch, transfer to new branch")
    args = parser.parse_args()
    
    if args.branch:
        switch_branch(args.branch, not args.new_only)
    else:
        # Prompt the user for a branch name
        print("Please specify a branch name to switch to.")
        print(f"Usage: python {os.path.basename(sys.argv[0])} <branch_name> [-n/--new-only]")
        sys.exit(1)