---
name: Publish package checklist
about: Package development and publishing checklist
title: Publish package [name; v0.0.0]
labels: documentation
assignees: jhorback

---

## Development
- [ ] Checkout package branch.
- [ ] Merge master into branch.
- [ ] Develop and commit to branch until feature completion.

## Feature completion
- [ ] Build, run tests and coverage.
- [ ] Update package readme, changelog, and package version.
- [ ] Update root readme, and changelog.
- [ ] Merge into master.

## Update master version
- [ ] Update package version.
- [ ] Add release to git; add changelog notes for the specific release.
- [ ] Publish new packages.