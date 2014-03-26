# Seam (v2)

# Purpose

I found the current node.js backed CI systems bloated and packed with features I didn't need.
Furthermore, I wanted something that used the Github Webhook API and didn't need to be fully
authorized as an application. Simply put, I wanted one thing done, and I wanted it done well.


# Usage

```
npm install https://github.com/distracteddev/seam/tarball/master;
cd seam;
forever start index.js;
```


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


# Modules Used:

* yargs
* ShellJS
* Forever
* Express
* Node-OSX-Notifier
