require('shelljs/global');
config.silent = true;

var http = require('http');
var url = require('url');
var path = require('path');

function SeamClient(config) {
  if (!(this instanceof SeamClient)) {return new SeamClient(config)}
  this.baseUrl = config.seam_url || config.url;
  var details = getRepoDetails();
  this.repoOwner = details.repoOwner;
  this.repoName  = details.repoName;
  this._request   = request.bind(this);
}

function getRepoDetails() {
  var gitUrl =  exec('git config --get remote.origin.url').output;
  console.log('gitUrl', gitUrl);
  var matches = RegExp('(.+):(\\w+)/(.+)\\.?').exec(gitUrl);
  console.log('matches', matches);
  return {
    repoOwner: matches[2],
    repoName:  matches[3]
  }
}

SeamClient.prototype.info = function() {
  this._request('info');
};

SeamClient.prototype.start = function() {
  this._request('start');
};

SeamClient.prototype.stop = function() {
  this._request('stop');
};

SeamClient.prototype.restart = function() {
  this._request('restart');
};

SeamClient.prototype.logs = function() {
  this._request('logs');
};

SeamClient.prototype.clean = function() {
  this._request('clean');
};

SeamClient.prototype.open = function() {
  var pkgDotJSON = require(path.join(process.cwd(), 'package.json'));
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
  var urlToOpen = url.parse(this.baseUrl);
  urlToOpen.port = port.toString();
  delete urlToOpen.host;
  urlToOpen = url.format(urlToOpen);
  exec('open ' + urlToOpen);
};

function request(command) {
  var targetUrl = url.resolve(this.baseUrl, [command, this.repoOwner, this.repoName].join('/'));
  var req = http.get(targetUrl, function(res) {
    res.on('data', function(data) {
      if (data.toString().trim().length > 0) {
        console.log(data.toString().trim());
      }
    });
  })
  var self = this;
  req.on('error', function(e) {
    if (e.code === 'ECONNREFUSED') {
      console.error('Could not reach host at url', self.baseUrl);
    } else {
      console.error(e)
    }
  });
}


module.exports = SeamClient;
