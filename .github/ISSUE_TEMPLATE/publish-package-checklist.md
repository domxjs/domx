---
name: Publish package checklist
about: Package development and publishing checklist
title: Publish package Name; v0.0.0
labels: documentation
assignees: jhorback

---

## Packages to Publish
- [ ] Name; v0.0.0

## Development
- [ ] Create new feature branch.
- [ ] Merge master into branch.
- [ ] Develop and commit to branch until feature completion.

## Feature completion
- [ ] Build, run tests and coverage.
- [ ] Create badges `npm run badges`
- [ ] Update package readme, changelog, and package version.
- [ ] Update package dependencies with new versions
- [ ] Update root readme, and changelog.
- [ ] Confirm tests / build passing
- [ ] Merge into master.
- [ ] Merge into package branch (for test reporting)

## Update master version
- [ ] Confirm tests / build passing after merger
- [ ] Update package version.
- [ ] Push git tags `git push origin --tags`.
- [ ] Add release to git; add changelog notes for the specific release.
- [ ] Publish new packages.
