#!/bin/bash
# Script to automatically commit and push changes to GitHub
git add .
if [ -n "$(git status --porcelain)" ]; then
    git commit -m "Auto-commit: $(date +'%Y-%m-%d %H:%M:%S')"
    git push origin $(git branch --show-current)
    echo "Changes pushed to GitHub successfully!"
else
    echo "No changes to commit."
fi