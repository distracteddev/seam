var restify = require('restify');
var serverPort = require('./config.json').port + 1;
var path = require('path');
var repoDir    = require('./config.json').repoDir || path.join(process.env.HOME, 'apps');
var HOST_URL = require('./config.json').seam_url || '';
var Repo = require('./repo');

function info(req, res, next) {
  res.send('Info');
}

function start(req, res, next) {
  try {
    res.contentType = 'text';
    req.repo.start();
    res.send('Repo ' + req.repo.remote + ' started');
  } catch(e) {
    res.contentType = 'text';
    res.send(404, e.message);
  }
}

function stop(req, res, next) {
  try {
    req.repo.stop();
    res.contentType = 'text';
    res.send('Repo ' + req.repo.remote + ' stopped');
  } catch(e) {
    res.contentType = 'text';
    res.send(404, e.message);
  }
}

function restart(req, res, next) {
  try {
    req.repo.restart();
    res.contentType = 'text';
    res.send('Repo ' + req.repo.remote + ' restarted');
  } catch(e) {
    res.contentType = 'text';
    res.send(404, e.message);
  }
}

function clean(req, res, next) {
  try {
    req.repo.clean();
    res.contentType = 'text';
    res.send('Repo ' + req.repo.remote + ' cleaned')
  } catch(e) {
    res.contentType = 'text';
    res.send(404, e.message);
  }
}

function logs(req, res, next) {
  try {
    var stream = req.repo.logs();
    stream.stdout.pipe(res);
    stream.stderr.pipe(res);
  } catch(e) {
    console.error(e);
    res.contentType = 'text';
    res.send(404, e.message);
  }
}

var server = restify.createServer();
server.use(function(req, res, next) {
  if (req.params.owner && req.params.name) {
    console.log('Repo Route Detected');
    req.repo = getRepo(req);
  }
  next();
});
server.get('/repo/:owner/:name', info);
server.get('/start/:owner/:name', start);
server.get('/stop/:owner/:name', stop);
server.get('/restart/:owner/:name', restart);
server.get('/logs/:owner/:name', logs);
server.get('/clean/:owner/:name', clean);

server.listen(serverPort, function() {
  console.log('[HttpHook] listening for http requests on', server.url);
});


// Helpers
function getGithubURL(repoOwner, repoName) {
  var url = 'git@github.com:/{owner}/{repoName}.git'
  url = url.replace('{owner}', repoOwner);
  url = url.replace('{repoName}', repoName);
  return url;
}

function getRepo(req) {
  var owner = req.params.owner;
  var repoName = req.params.name;
  var repo = new Repo(repoDir, getGithubURL(owner, repoName));
  return repo;
}