require('shelljs/global');
var path = require('path');
var SILENT = process.env.DEBUG || true;

if (!which('git')) {
  echo('Sorry, this script requires git');
  exit(1);
}

var Repo = function(repoDir, remoteUri) {
  if (!repoDir) {
    throw new Error("A Repo must be created with a repoDir");
  }
  this.path = repoDir;
  this.remote = remoteUri;
  this.folderName = path.basename(remoteUri, '.git');
  this.absPath = path.join(this.path, this.folderName);
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
    if (result.code === 128) {
      // Just in case our earlier check failed...
      console.log('Repo already cloned, updating now...');
      this.update();
    } else if (result.code === 0) {
      console.log('Repo Successfully Cloned');
    } else {
      throw new Error("Repo.Clone Unexpectedly Failed");
    }
  }

}

Repo.prototype.update = function() {
  cd(this.absPath);
  var result = exec('git pull origin master', {silent: SILENT});
  if (result.code !== 0) {
    console.error(result.output);
    throw new Error("Unexpected Error while Updating Repo", this);
  } else {
    console.log('Repo', this.folderName, 'Successfully Updated')
  }
}

Repo.prototype.start = function() {
  this.npmInstall();
  // this.build();
  cd(this.absPath);
  var pkgDotJSON = require(path.join(this.absPath, 'package.json'));
  console.log(pkgDotJSON.config);
  var port = pkgDotJSON.config.port
  if (!isPortOpen(port)) {
    throw new Error("Port " + port + " is not available");
  }
  var foreverOpts = 'forever start -c "npm start" -e err.log -o out.log -l forever.log -a .'
  env['DEBUG'] = true;
  env['PORT'] = port;
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

Repo.prototype.npmInstall = function() {
  console.log('Running npm install');
  cd(this.absPath);
  var result = exec('npm install');
  if (result.code !== 0) {
    throw new error('Unexpected Error while npm installing Repo', this.folderName);
  }
}

Repo.prototype.build = function() {
  console.log('Running npm build');
  cd(this.absPath);
  var result = exec('npm run-script build');
  if (result.code !== 0) {
    throw new error('Unexpected Error while building Repo', this.folderName);
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