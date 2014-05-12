var githubhook = require('githubhook');
var path = require('path');
var serverPort = require('./config.json').port;
var repoDir    = require('./config.json').repoDir || path.join(process.env.HOME, 'apps');
var github = githubhook({logger: console, port: serverPort});
var Repo = require('./repo');
var config = require('./config');

github.listen();

github.on('push', function (repo, ref, data) {
  console.log('** Github Push Detected **');
  console.log('repo', repo);
  console.log('ref', ref);
  var branch = ref.split('/').pop();
  console.log('branch', branch)
  console.log('data', data);
  if (config[repo] && config[repo].branch === branch) {
    updateRepo(getGithubURL(data.repository));
  } else if (!config[repo] || !config[repo].branch) {
    updateRepo(getGithubURL(data.repository));
  }
});

function getGithubURL(repository) {
  var url = 'git@github.com:/{owner}/{repoName}.git'
  url = url.replace('{owner}', repository.owner.name);
  url = url.replace('{repoName}', repository.name);
  return url;
}

function updateRepo(githubUrl) {
  var repo = new Repo(repoDir, githubUrl);
  try {
    repo.clone();
    repo.start();
  } catch(e) {
    console.error('Error while trying to update repo', githubUrl);
    console.error(e);
    try {
      repo.restart();
    } catch (e) {
      console.error('Error while trying to restart repo', githubUrl);
      console.error(e);
    }
  }
}

exports.updateRepo = updateRepo;