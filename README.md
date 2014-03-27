# Seam (v2)

# Purpose

* Provide a simple CI implementatuion that meets the following requirements:
  * Relies on the Webhook API instead of authentication
  * Does not wipe node_modules on each deploy
  * Has a single point of configuration (Your repo's package.json)
    * Relies on the "npm start" command for deploy scripts
    * Also see "[npm prestart](https://www.npmjs.org/doc/misc/npm-scripts.html)"
      if a build step is required (e.g grunt, gulp, etc)
  * Provides a CLI tool for start/stop/restart/test/logs commands
    * The response should also be delivered via the CLI
    * The CLI tool should provide a way of streaming logs directly to a local console
    * The CLI tool should have no required configuration
  * Should have the option to enable email notifications
  * Should have the option to enable native OSX Notifications
  * Provides a basic UI (In the futre...)


# Usage

There are two steps to setting up Seam:

1. Configure & Start the Seam server
  * YOU ONLY DO THIS ON ONCE, ON YOUR SERVER
2. Configure Your Repos to be Deployed via Seam
  * DO THIS FOR EVERY REPO YOU WANT DEPLOYED

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

#### App Specific ENV Variables

You will need to set any specific ENV variables needed using your
package.json's config property:

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

#### Pointing Your Repo's Webhook to Seam

Go to the 'settings' page of your repo and add ```http://{yourhost}:{port}/github/callback```
as a webhook end-point for push events. You should replace ```{yourhost}``` and ```{port}```
with the appropriate values for your Seam deployment.

# TODO

* Finish REST API
* Implement CLI
* Implement locking so that multiple events don't spawn multiple handlers
* Send response back to Github hook before all steps are completed to avoid timeout
* Clean up and general refactor to ensure proper separation of concerns and helpful comments
* Add support for Gitlab Webhook Payloads (Should be done within the githubhook repo)
* Support a seam.json config file in the repo if a config block is not found in the package.json