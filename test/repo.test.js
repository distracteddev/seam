var assert = require('assert');
var path = require('path');
var Repo = require('../repo');
var fs  = require('fs');

var targetPath = path.join(__dirname, 'repos');
var targetRepo = 'git@github.com:Pixate/protostyle-web.git' || 'git@github.com:distracteddev/sassWatch.git'
var repo;

exports.testNewRepo = function() {
  repo = new Repo(targetPath, targetRepo);
  assert.eql(targetPath, repo.path);
  assert.eql(targetRepo, repo.remote);
}

exports.testCloneRepo = function() {
  repo.clone();
}

exports.testStart = function() {
  repo.start();
}

exports.testRestart = function() {
  repo.restart();
}