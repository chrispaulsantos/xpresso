## v1.1.9
- Changed to process.cwd() because process.env.PWD is not set in Windows
- Fixed bug in get project path
- Fixed bug where postinstall was failing on Windows
- Added info command to get info about project 
## v1.1.8
- Moved auth service functions out of auth service
- Added JWTPayload class
- Removed loading ui functionality