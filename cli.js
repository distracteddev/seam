#!/usr/bin/env node
// console.log('Binary Started');
// console.log('cwd', process.cwd());
// console.log('__dirname', __dirname);
var config = require('./config.json');
// console.log('Config\n' + JSON.stringify(config, null, 4));
var prompt = require('prompt');
var fs = require('fs');
var path = require('path');

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


var client = require('./client')(config);

client.open();

