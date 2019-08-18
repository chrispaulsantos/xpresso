# XPRESSO

An express typescript generator to quickly develop REST API's

![NpmVersion](https://img.shields.io/npm/v/xpresso.svg)
![Travis (.org) branch](https://img.shields.io/travis/chrispaulsantos/xpresso/master.svg)
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

Navigate to the directory you wish to create the project in, and run the init command, followed by the project name. A new folder will be created that follows the name you provide:
```bash
$ cd projects && xpresso init comics
```

Navigate into the newly created directory and create a CRUD route with the ``route`` command:
```bash
$ cd comics && xpresso route comic
```

Next, create a comic model with the ``model`` command:
```bash
$ xpresso model comic
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
- Dynamic route creation
- Custom logger with context id
- Request logging with context id
- Tests with Jest

## Usage

### commands
Base commands available from the CLI
```bash
$ xpresso
    init [options] [name]
    model [name]
    route [options] [name]
```

### init
Generates a new xpresso project
```bash
$ xpresso init [options] [name]
    -r, --repo [repo]        specify repository for the project
    -s, --summary [summary]  set the summary of the project
    --no-auth                disables jwt authentication
```

### route 
Generates a new model
```bash
$ xpresso route [options] [name]
    -w, --websocket  add a websocket handler
    --no-auth        disables jwt authentication for this route
    --no-spec        disables spec file generation for this route
```

### model 
Generates a new model
```bash
$ xpresso model [name]
```

## Todo
- Option to disable database