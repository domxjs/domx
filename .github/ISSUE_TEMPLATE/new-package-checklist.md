---
name: New package checklist
about: A checklist when creating a new package for the mono repo
title: Create package [name]
labels: documentation
assignees: jhorback

---

This mono repo uses NPM workspaces set to pull in any package in the `packages` folder.

There is a branch and travis matrix for each package to report build statuses for individual packages. 

## Creating a package
- [ ] Create new package branch to work off of
- [ ] Create package folder
- [ ] Create necessary files and copy relevant settings from another package.
  - .gitignore
  - .npmignore
  - CHANGELOG.md
  - README.md
  - package.json
  - tsconfig.json
  - src folder
- [ ] Update the root tsconfig.json references
- [ ] Update the travis-ci matrix in the .travis.yml file
- [ ] Add the package to the root readme.md
- [ ] Check in branch and confirm build is running
