## v1.2.6
- Removed source code packages from xpresso package.json
- Updated test roots to avoid running tests in the template directory
## v1.2.5
- Fixed bug with route test creation
## v1.2.4
- Fixed bug with incorrect require path
## v1.2.3
- Added option to choose database type
## v1.2.2
- Updated project structure
- Added supertest for testing
- Updated architecture for testing
## v1.2.1
- Fixed bug preventing models and routes from being generated
## v1.2.0
- Added model command
- Added route command
- Removed i, generate, and g commands
- Added global NAME_REPLACEMENTS to be resuable throughout the life of the command
- Updated setting up the environment when a xpresso command is run
## v1.1.9
- Changed to process.cwd() because process.env.PWD is not set in Windows
- Fixed bug in get project path
- Fixed bug where postinstall was failing on Windows
- Added info command to get info about project 
## v1.1.8
- Moved auth service functions out of auth service
- Added JWTPayload class
- Removed loading ui functionality