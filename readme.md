# XPRESSO

An express typescript generator to quickly develop REST API's

![NpmVersion](https://img.shields.io/npm/v/xpresso.svg)
![Travis (.org) branch](https://img.shields.io/travis/chrispaulsantos/xpresso/develop.svg)
![npm](https://img.shields.io/npm/dt/xpresso.svg)
![GitHub pull requests](https://img.shields.io/github/issues-pr/chrispaulsantos/xpresso.svg)
![GitHub issues](https://img.shields.io/github/issues/chrispaulsantos/xpresso.svg)

## Installation
```bash
$ npm install -g xpresso
```

## Quick Start
Install the cli tool
```bash
$ npm install -g xpresso
```

**Note - by default the project will connect to mongodb at mongodb://localhost:27017, so ensure a mongo server is running on your local machine, otherwise specify the desired mongo uri with the ``--dbUrl`` flag when running ``xpresso init``.**

Navigate to the directory you wish to creat the project in, and run the init command, followed by the project name. A new folder will be created that follows the name you provide:
```bash
$ cd projects && xpresso init comics
```

Navigate into the newly created directory and create a CRUD route with the ``generate`` command:
```bash
$ cd comics && xpresso generate comic
```

Build the project with the ```npm``` command:
```bash
$ npm run build
```

Start the server:
```bash
$ npm start
```

Use any REST client to test out the generated API

## Features
- Generates typescript project
- JWT authentication
- Mongodb database
- Mongoose model generation
- Dynamic route creation
- Custom logger with context id
- Request logging with context id
- Tests with Jest

## Usage

### commands
Base commands available from the CLI
```bash
$ xpresso
    init | i [options] [name]
    generate | g [options] [name]
```

### init
Generates a new xpresso project
```bash
$ xpresso init | i [options] [name]
    -r, --repo [repo]        specify repository for the project
    -s, --summary [summary]  set the summary of the project
    -d, --dbUrl [dbUrl]      specify a development database url
    --no-auth                disables jwt authentication
    --no-refresh             disables rolling token refresh
```

### generate
Generates a new api route with the prove
```bash
$ xpresso generate | g [options] [name]
    -w, --websocket  add a websocket handler
    --no-auth        disables jwt authentication for the route
```

## Todo
- Option to disable database
- Passport integration
- Restructure to host front end code base
- Serve from backend on production build