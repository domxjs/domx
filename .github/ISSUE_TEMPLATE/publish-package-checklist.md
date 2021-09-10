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
- [ ] Create badges `npm run badges`
- [ ] Update package readme, changelog, and package version.
- [ ] Update root readme, and changelog.
- [ ] Merge into master.

## Update master version
- [ ] Update package version.
- [ ] Push git tags `git push origin --tags`.
- [ ] Add release to git; add changelog notes for the specific release.
- [ ] Publish new packages.
