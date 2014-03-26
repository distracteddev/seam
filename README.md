# Seam (v2)

# Purpose

I found the current node.js backed CI systems bloated and packed with features I didn't need.
Furthermore, I wanted something that used the Github Webhook API and didn't need to be fully
authorized as an application. tl;dr - I wanted one thing done, and I wanted it done well.


# Usage

There are two steps to setting up seam:

1. Configure & Start the Seam server
2. Configure Your Repos to be Deployed via Seam

## Configuring & Starting Seam

#### Configuration

You can configure Seam by editing the config.json found in the root of the repo.

Configurable Options:
* port (Default: 8002);

#### Starting Seam

```
git clone git@github.com:distracteddev/seam.git;
cd seam;
npm install;
forever start index.js;
```

## Configure Your Repos to be Deployed via Seam

#### Add Required ENV Variables to your package's package.json file

You will need to set them using your package.json's config property:

```
// In your package.json...
"name": 'Some Package Name',
"config": {
  "PORT": 8080
  "NODE_ENV": "prod"
}
```
or if you are already using the config block for something else, you can use the more verbose option
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

#### Pointing Github to Seam

Go to the 'settings' page of your repo and add ```http://{yourhost}:{port}/github/callback```
as a webhook end-point for push events. You should replace ```{yourhost}``` and ```{port}```
with the appropriate values for your Seam deployment.

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