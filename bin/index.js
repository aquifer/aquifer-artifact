/**
 * @file
 * Aquifer artifact creation.
 */

/* globals require, Aquifer, AquiferArtifactConfig, module */

module.exports = function(Aquifer, AquiferArtifactConfig) {

  'use strict';

  var AquiferArtifact  = function () {},
      _ = require('lodash'),
      path = require('path'),
      fs = require('fs-extra'),
      jsonFile = require('jsonfile'),
      mkdirp = require('mkdirp-then');

  AquiferArtifact.commands = function () {
    return {
      'build-artifact': {
        description: 'Creates a deployable artifact.',
      }
    };
  };

  AquiferArtifact.run = function (command, commandOptions, callback) {
    if (command !== 'build-artifact') {
      callback('Invalid command.');
      return;
    }

    var jsonPath        = path.join(Aquifer.projectDir, 'aquifer.json'),
        json            = jsonFile.readFileSync(jsonPath),
        make            = path.join(Aquifer.projectDir, json.paths.make),
        optionsMissing  = false,
        options         = {},
        build, destPath, repo, index;

    // Create the destination directory and initiate the promise chain.
    mkdirp(json.paths.builds)
      // Build the site.
      .then(function () {
        Aquifer.console.log('Building the site in ' + json.paths.builds + '...', 'status');

        var buildOptions = {
          symlink: false,
          delPatters: ['*', '!.git']
        };

        build = new Aquifer.api.build(json.paths.builds, buildOptions);

        return new Promise(function (resolve, reject) {
          build.create(make, false, path.join(Aquifer.projectDir, Aquifer.project.config.paths.make), false, function (error) {
            if (error) {
              reject();
            }
            else {
              resolve();
            }
          });
        });
      })

      // Copy over additional deployment files.
      .then(function () {
        Aquifer.console.log('Copying deployment files...', 'status');
        options.deploymentFiles.forEach(function (link) {
          var src   = path.join(Aquifer.projectDir, link.src),
              dest  = path.join(destPath, link.dest);
          fs.copySync(src, dest, {clobber: true});
        });
      })

      // Success!
      .then(function () {
        Aquifer.console.log('The artifact has been built.', 'success');
      })

      // Catch any errors.
      .catch(function (err) {
        callback(err);
      });
  };

  return AquiferArtifact;
};
