@copilot: Please follow Future-AI-Proejcts/contexts/personal_coding_style.md

# ⚡ Quick Git Command Utilities for Fish Shell

A collection of utility scripts to streamline common Git operations when working with the Fish shell.

## 🌿 Switch Branch

Safely switch to a new branch while handling uncommitted changes in two ways:
- **Default mode**: Automatically commits changes before switching
- **Transfer mode** (-n flag): Transfers uncommitted changes to the target branch via stashing

### Usage

```bash
python switch_branch.py <branch-name> [-n] # -n optionally added to save changes on new branch only

# Save changes on current branch (default behaviour)
python switch_branch.py <branch-name>

# Don't save changes on current branch, stash them instead
python switch_branch.py <branch-name> --no-save
```

> **Note**: `branch-name` is a required parameter

## 🔄 Reset Working Directory

This command will reset your working directory to match the remote branch exactly. 
**⚠️ Warning**: This will erase all uncommitted changes in your working files!

```bash
git fetch origin
git reset --hard origin/<branch-name>
```

# 🛠️ Utilities

## 🔄 Console.log to Alerts Converter for thefairies

Converts JavaScript console.log statements to alerts.add or alerts.debug calls with template literal formatting, making your logs more consistent and user-friendly.

### ✨ Features

- Converts console.log statements to alerts.add or alerts.debug
- Handles variable interpolation by converting + concatenation to ${} syntax
- Interactive mode for multiple conversions
- Command-line mode for quick single conversions

### 📋 Usage

```bash
# Interactive mode (recommended)
python3 console_2_alert.py

# Quick command line conversion (converts to alerts.add by default)
python3 console_2_alert.py "console.log('test:', variable)"
```

### 📊 Examples

Input:
```javascript
console.log('Room-edit: Adding timestamp to data:', updateData.last_updated)
```

Output as alerts.add:
```javascript
alerts.add(`Room-edit: Adding timestamp to data: ${updateData.last_updated}`, 2)
```

Output as alerts.debug:
```javascript
alerts.debug(`Room-edit: Adding timestamp to data: ${updateData.last_updated}`, logId)
```