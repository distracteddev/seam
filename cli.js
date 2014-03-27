#!/usr/bin/env node
// console.log('Binary Started');
// console.log('cwd', process.cwd());
// console.log('__dirname', __dirname);
require('shelljs/global');
var config = require('./config.json');
// console.log('Config\n' + JSON.stringify(config, null, 4));
var prompt = require('prompt');
var fs = require('fs');
var path = require('path');

// Check to see if the seam CLI Client knows where its pointing to
if (!config.seam_url) {
  console.log('Seam URL Not set, Please enter it now');
  prompt.start();
  var urlSchema = {
    name: 'Seam URL',
    conform: function(val) {
      if (val.indexOf('http://') > -1) {
        return true;
      } else if (val.indexOf('https://') > -1) {
        return true;
      } else {
        return false;
      }
    },
    required: true,
    message: 'Seam URL must be an absolute url that includes http:// or https://'
  }
  prompt.get(urlSchema, function(err, result) {
    if (err) {
      console.error('Unexpected Error, please file an issue at https://github.com/distracteddev/seam');
      process.exit(1);
    }
    config['seam_url'] = result['Seam URL'];
    var configFile = JSON.stringify(config, null, 4);
    // console.log('result', configFile);
    fs.writeFileSync(path.join(__dirname, './config.json'), configFile);
    // console.log('config.json updated');
  })
}

// Check if we are in a git repo
// Check if we there is a package.json
function checkPrereqs() {
  var gitPath = path.join(process.cwd(), '.git')
  if (!test('-e', gitPath)) {
    console.error('seam must be run inside of a git repo')
    process.exit(1);
  }
  var pkgDotJsonPath = path.join(process.cwd(), 'package.json');
  if (!test('-e', pkgDotJsonPath)) {
    console.error('seam must be run inside of folder with a package.json')
    process.exit(1);
  }
}

checkPrereqs();

var client = require('./client')(config);

var argv = require('yargs').argv;

checkPrereqs();

var command = argv._[0]
var commands = ['start', 'stop', 'restart', 'logs', 'clean', 'open'];

if (!command) {
  console.log('Seam CLI Commands:')
  commands.forEach(function(cmd) {
    console.log('  ' + cmd);
  });
} else if (commands.indexOf(command) > -1 ) {
  client[command]();
} else {
  console.log('Please chose from the following commands:')
  commands.forEach(function(cmd) {
    console.log('  ' + cmd);
  });
}

