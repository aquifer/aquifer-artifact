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

    var make            = Aquifer.project.absolutePaths.make,
        optionsMissing  = false,
        options         = {},
        build, destPath, repo, index;

    // Create the destination directory and initiate the promise chain.
    mkdirp(json.paths.builds)
      // Build the site.
      .then(function () {
        Aquifer.console.log('Building the site in ' + json.paths.build + '...', 'status');

        var buildOptions = {
          symlink: false,
          delPatters: ['*', '!.git']
        };

        build = new Aquifer.api.build(json.paths.build, buildOptions);

        return new Promise(function (resolve, reject) {
          build.create(make, false, path.join(Aquifer.projectDir, Aquifer.project.config.paths.make), false, function (error) {
            if (error) {
              Aquifer.console.log(error, 'error');
              reject();
            }
            else {
              resolve();
            }
          });
        });
      })

      // Create artifact.
      .then(function () {
        var timestamp = Math.floor(Date.now() / 1000).toString();
        var src = path.join(Aquifer.projectDir, json.paths.build),
            dest = path.join(Aquifer.projectDir, json.paths.builds, timestamp);
        Aquifer.console.log('Creating artifact in ' + dest, 'status');
        fs.copySync(src, dest, {clobber: true});
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
