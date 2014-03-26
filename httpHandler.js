var restify = require('restify');
var serverPort = require('./config.json').port + 1;

function getGithubURL(repoOwner, repoName) {
  var url = 'git@github.com:/{owner}/{repoName}.git'
  url = url.replace('{owner}', repoOwner);
  url = url.replace('{repoName}', repoName);
  return url;
}

function getRepo(req, res, next) {
  res.send('Getting Data For ' + getGithubURL(req.params.owner, req.params.name));
  next();
}

function postRepo(req, res, next) {
  res.send('Updating and Starting ' + getGithubURL(req.params.owner, req.params.name));
  next();
}

var server = restify.createServer();
server.get('/repo/:owner/:name', getRepo);
server.post('/repo/:owner/:name', postRepo);

server.listen(serverPort, function() {
  console.log('[HttpHook] listening for http requests on', server.url);
});