# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Updated
- EventMap decorators

## [0.6.1] - 2021-09-10
### Updated
- Documentation 

## [0.6.0] - 2021-09-04
## Added
- String option for property name; [#15](https://github.com/domxjs/domx/issues/15)

## Updated
- Logging to include the state property name

## Breaking Changes
- [#15](https://github.com/domxjs/domx/issues/15) Updated option names from
`prop` to `property` and from `changeEventName` to `changeEvent`.

## [0.5.0] - 2021-08-16
### Added
- Names to metadata
### Updated
- Console logging and RDT middleware messages

## [0.4.0] - 2021-08-12
### Added
- Check for calling middleware twice
- Collapsed option for logging middleware
- Added immer middleware

### Fixed
- Interface with RDT extension to match live browser tests


## [0.3.5] - 2021-08-07
### Changed
- Middleware function names

## [0.3.4] - 2021-08-05
### Updated
- Updates for package publishing

## [0.3.0] - 2021-08-04
### Added
- Middleware for Redux dev tools logging

## [0.2.0] - 2021-08-03
### Changed
- Converted to TypeScript

## [0.1.0] - 2017-09-13
- Initial implementation.
