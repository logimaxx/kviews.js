Typical release flow
- Finish your src/ (and any doc) edits.
- npm run release
- If the script reports uncommitted build output: git add dist website/dist (and anything else) → git commit
- npm version patch (or minor / major)
- npm publish
- git push && git push --tags