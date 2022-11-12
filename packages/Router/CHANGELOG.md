# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [1.1.0] 2022-11-12
### Updated
- domx-route-not-found route calls preventDefault on the route-not-found event
- domx-route-not-found activeElement lifecycle

## [1.0.1] 2022-10-03
### Fixed
- router back navigation issue

## [1.0.0] 2022-10-03
### Updated
- dependencies

## [0.3.0] 2021-09-30
### Added
- cache-count implementation on domx-route
### Updated
- Updated the behavior around when an element is created/cached.

## [0.2.0] 2021-09-29
### Added
- window event for not found routes
- domx-route-not-found element

### Breaking Changes
- renamed element class names to kebab case (mainly effects DomxRoute -> domx-route)


## [0.1.2] 2021-09-22
### Updated
- dependencies

## [0.1.1] 2021-09-22
### Updated
- dependencies and audit

## [0.1.0] 2021-09-22
### Added
- Router
- DomxLocation
- DomxRouteData
- DomxRoute
