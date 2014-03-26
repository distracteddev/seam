# Seam (v2)

# Purpose

I found the current node.js backed CI systems bloated and packed with features I didn't need.
Furthermore, I wanted something that used the Github Webhook API and didn't need to be fully
authorized as an application. Simply put, I wanted one thing done, and I wanted it done well.


# Usage

### Configuration

You can configure Seam by editing the config.json found in the root of the repo.

Configurable Options:
* port (Default: 8002);

### Starting Seam

```
git clone git@github.com:distracteddev/seam.git;
cd seam;
npm install;
forever start index.js;
```
### If your Node app requires specific ENV variables...

You will need to set them using your package.json's config property:

```
"name": 'Some Package Name',
"config": {
  "PORT": 8080
  "NODE_ENV": "prod"
}
```
or
```
// In your package.json...
"name": 'Some Package Name',
"config": {
  "SEAM_ENV": {
    "PORT": 8080
    "NODE_ENV": "prod"
  }
}
```

### Pointing Github to Seam

Go to the 'settings' of your Repo and add http://<yourhost>:<port>/github/callback as a webhook end point for push events only


# First-Class Features

* Listens for Webhooks and "Builds" then calls NPM Start  (Completed)
* REST API + Node.js Binary CLI Client (Possibly a streaming client) (TODO)
* Starts on a custom port defined by config.json or package.json (Completed)
* Uses forever by default (Completed)
* Native OSX Notifications (TODO)
* CLI Commands:      (TODO)
    * Start
      * On the server -- Start the Application
    * Stop
    * Open
    * Test


# TODO

* Implement locking so that multiple events don't spawn multiple handlers
* Send response back to Github hook before all steps are completed to avoid timeout
* Clean up and general refactor to ensure proper separation of concerns and helpful comments

# Modules Used:

* yargs
* ShellJS
* Forever
* Express
* Node-OSX-Notifier
