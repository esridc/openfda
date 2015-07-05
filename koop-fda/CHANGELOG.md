# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [1.0.0] - 2015-07-01

### Added
* Added many unit tests to prepare for production deploy

### Changed
* Scrape returns a callback when completed successfully or in failure
* Removed all console logs and replaced with debug, error or info
* Underscore.js is no longer included

## [0.0.2] - 2015-06-28

### Changed
* Rows are not requested from the database if export file already exists

### Fixed
* Export files are reused when appropriate

## [0.0.1] - 2015-06-26

### Changed
* State geometries are greatly simplified

### Fixed
* Exports no longer sent to undefined directory

## 0.0.0 - 2015-06-26

### Added
* A single route that accesses all of api.fda.gov/food/enforncement
* Enforcment events are enriched with the geometries of the states they affect

[1.0.0]: https://github.com/koopjs/koop-fda/compare/v1.0.0...v0.0.2
[0.0.2]: https://github.com/koopjs/koop-fda/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/koopjs/koop-fda/compare/v0.0.0...v0.0.1
