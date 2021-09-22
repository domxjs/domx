
# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.1] 2021-09-22
### Updated
- dependencies and audit

## [0.5.0] 2021-09-22
### Added
- applyDataElementRdtLogging option for excludes
- RootState.snapshot method
### Updated
- DataElement.dispatchChange method to take a change parameter

### Breaking Change
- Moved decorators to a decorators file

## [0.4.1] - 2021-09-10
### Updated
- Documentation 

## [0.4.0] 2021-09-09
## Fixed
- Fixes while testing in other applications; [#49](https://github.com/domxjs/domx/issues/49)
  - DataElement syncing
  - refreshState syncing

### Updated
- refreshState signature and behavior
- Action name for Redux Dev Tool logging

## [0.3.0] 2021-09-08
### Added
- Middleware for DataElement
- Redux Dev Tool logging

## [0.2.0] 2021-09-07
### Added
- refreshState method
- dispatchChange method

### Updated
- Documentation and examples

## [0.1.0] 2021-09-06
### Added
- DataElement
- RootState
