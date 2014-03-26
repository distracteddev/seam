# Github Auto Update (Seam v2)

# Purpose

I found the current node.js backed CI systems bloated and packed with features I didn't need.
Furthermore, I wanted something that used the Github Webhook API and didn't need to be fully
authorized as an application. Simply put, I wanted one thing done, and I wanted it done well.


# First-Class Features

* Listens for Webhooks and "Builds" then calls NPM Start
* REST API + Node.js Binary CLI Client (Possibly a streaming client)
* Starts on a custom port defined by config.json or package.json
* Uses forever by default (Should use forever watch)
* npm installed into the same folder as your app + git repo
* use env var or local cofig via binary for hostname;
* Native OSX Notifications
* Commands:
    * Start
      * On the server -- Start the Application
    * Stop
    * Open
    * Test


# Source Organization

* Repo.js                                                 (Helpers to Pull, npm instll, and test)
* HookHandler.js                                          (Server)
* CommandServer.js                                        (Server)
* Client.js                                               (Command Line Client)
* Config.js                                               (CLI Configuration)
* A Binary Version
* Notifier.js                                             (Node-OSX-Notifier Wrapper)
* Mailer.js                                               (Email Notifications & Custom Notification Hooks -- e.g Slack)


# Modules Used:

* yargs
* ShellJS
* Forever
* Express
* Node-OSX-Notifier
