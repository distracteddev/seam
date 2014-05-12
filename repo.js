require('shelljs/global');
var path = require('path');
var config = require('./config');
var SILENT = process.env.DEBUG || true;

if (!which('git')) {
  echo('Sorry, this script requires git');
  exit(1);
}

var Repo = function(repoDir, remoteUri, logger) {
  if (!repoDir) {
    throw new Error("A Repo must be created with a repoDir");
  }
  this.path = repoDir;
  this.remote = remoteUri;
  this.folderName = path.basename(remoteUri, '.git');
  this.absPath = path.join(this.path, this.folderName);
  this.logger = logger;

  var branch = 'master';
  if (config[this.folderName] && config[this.folderName].branch) {
    branch = config[this.folderName].branch
  }
  this.branch = branch;
}

Repo.prototype.clone = function() {
  cd(this.path);
  if (test('-e', this.absPath)) {
    console.log('Repo already cloned, updating now...');
    this.update();
  } else {
    if (!this.remote) {
      throw new Error("New Repo Asked to Clone without a remote specified");
    }
    var result = exec('git clone ' + this.remote, {silent: false});
    if (result.code === 0) {
      console.log('Repo Successfully Cloned');
    } else {
      console.error("Repo.Clone Unexpectedly Failed with code " + result.code);
      throw new Error(result.output + '\nRepo URL: ' + this.remote);
    }
    this.update();
  }

}

Repo.prototype.update = function() {
  cd(this.absPath);
  var cmd = 'git pull origin ' + this.branch;
  var result = exec(cmd, {silent: SILENT});
  if (result.code !== 0) {
    console.error(result.output);
    throw new Error("Unexpected Error while Updating Repo", this);
  } else {
    console.log('Repo', this.folderName, 'Successfully Updated')
  }
}

// TODO: Refactor this function
Repo.prototype.start = function() {
  // Has the repo been cloned before?
  if (!test('-e', this.absPath)) {
    console.log('Tried to start uncloned repo, cloning now');
    this.clone();
  }

  // Get the Repo's Configuration and Port
  cd(this.absPath);
  var pkgDotJSON = require(path.join(this.absPath, 'package.json'));
  console.log(pkgDotJSON.config);
  if (!pkgDotJSON.config) {
    throw new Error("No npm-config found for repo", this.folderName);
  }
  var port = (
               pkgDotJSON.config.port ||
               pkgDotJSON.config.PORT ||
               (
                pkgDotJSON.config.SEAM_ENV &&
                  (
                    pkgDotJSON.config.SEAM_ENV.port ||
                    pkgDotJSON.config.SEAM_ENV.PORT
                  )
               )
             );
  this.port = port;
  // The repo has been cloned and now we npm-install and build
  this.npmInstall();
  this.build();

  // Check to see if the repo or another app has already been started on this port.
  if (!isPortOpen(port)) {
    var err = new Error("Repo Already Started or Port " + port + " is not available");
    err.code = "PORTINUSE"
    throw err;
  }

  var foreverOpts = 'forever start -c "npm start" -e err.log -o out.log -l forever.log -a .';
  env['PORT'] = port;
  var CUSTOM_ENV = pkgDotJSON.config.SEAM_ENV || pkgDotJSON.config;
  if (CUSTOM_ENV) {
    for (key in CUSTOM_ENV) {
      env[key] = CUSTOM_ENV[key];
    }
  }

  // We can now launch the repo with forever
  var startCommand = foreverOpts || 'PORT=' + port + ' ' + foreverOpts;
  console.log('Start Command', startCommand);
  var result = exec(startCommand, {silent: SILENT});
  if (result.code !== 0) {
    console.error(result.output);
    throw new Error("Unexpected Error while Starting Repo", this);
  } else {
    console.log('Repo', this.folderName, 'Successfully Started')
  }
}

Repo.prototype.restart = function() {
  if (!test('-e', this.absPath)) {
    throw new Error('Cannot restart a repo that has never been started');
    return;
  }
  cd(this.absPath);
  var restartCmd = 'forever restart ' + this.absPath;
  var result = exec(restartCmd, {silent: SILENT});
  if (result.code !== 0) {
    console.error(result.output);
    throw new Error("Restarting repo " + this.folderName + " failed");
  } else {
    console.log('Repo', this.folderName, 'Successfully Restarted');
  }
}

Repo.prototype.stop = function() {
  if (!test('-e', this.absPath)) {
    throw new Error('Cannot stop a repo that has never been started');
    return;
  }
  cd(this.absPath);
  var stopCmd = 'forever stop ' + this.absPath;
  var result = exec(stopCmd, {silent: SILENT});
  if (result.code !== 0) {
    console.error(result.output);
    throw new Error("Stopping repo " + this.folderName + " failed\n" + result.output);
  } else {
    console.log('Repo', this.folderName, 'Successfully Stopped');
  }
}

Repo.prototype.clean = function() {
  if (!test('-d', this.absPath)) {
    throw new Error('Cannot clean a repo that has never been cloned or started');
    return;
  }
  try {
    this.stop();
  } catch (e) {
    // Repo was never started
  }
  var result = rm('-rf', this.absPath);
  if (result && result.code !== 0) {
    throw new Error('Could not clean ' + this.absPath + '\n' + result.output);
  }
}

Repo.prototype.logs = function(n) {
  if (!test('-e', this.absPath)) {
    throw new Error('Cannot Get Logs for a Repo that has never been started');
    return;
  }
  cd(this.absPath)
  var outFile = 'out.log';
  var errFile = 'err.log';
  n = n || 100;
  var command = ['tail -n', n, '-f', outFile, errFile].join(' ');
  var child = exec(command, {async:true, silent: true});
  return child;
}

Repo.prototype.npmInstall = function() {
  console.log('Running npm install');
  cd(this.absPath);
  var result = exec('npm install');
  if (result.code !== 0) {
    throw new error('Unexpected Error while npm installing Repo', this.folderName);
  }
}

Repo.prototype.build = function() {
  console.log('Running npm run-script build');
  cd(this.absPath);
  var result = exec('npm run-script build');
  if (result.code !== 0) {
    throw new error('Unexpected Error while npm installing Repo', this.folderName);
  }
}

Repo.prototype.test = function() {

}

Repo.prototype.getStartFile = function() {
  cd(this.absPath);
  if (test('-e', 'index.js')) return 'index.js';
  if (test('-e', 'app.js')) return 'app.js';
}


module.exports = Repo;



function isPortOpen(portNum) {
  var cmd = "netstat -an | egrep 'Proto|LISTEN' | grep " + portNum;
  var result = exec(cmd, {silent: SILENT});
  if (result.code === 0 && result.output.length > 0) {
    return false;
  } else if (result.code === 1 && result.output.length === 0) {
    return true;
  } else {
    console.log(result);
    throw new Error("Unexpected error while checking if port is open");
  }
}