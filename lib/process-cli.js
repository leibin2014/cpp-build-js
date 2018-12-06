/**
 * @file lib/process-cli.js
 * Processes command-line arguments passed into the application.
 */

// Imports
const commander = require('commander');
const compilerProfiles = require('./compiler-profiles');

/**
 * Processes command-line arguments passed into the application.
 * @return {object} The parsed command-line options.
 */
module.exports = () => {
  commander
    .version('1.0.1')
    .description(
      'Processes C/C++ application build scripts written in Javascript.'
    )
    .option('-d, --dev', 'Run this application in development mode?')
    .option(
      '-c, --compiler-profile [compiler profile]',
      'Specifies a supported compiler profile to use.',
      'g++'
    )
    .option(
      '-p, --projects [list of projects]',
      'Specifies a comma-separated list of project directories to scan.',
      ''
    )
    .option(
      '-m, --build-mode [build mode]',
      'Specifies a build mode under which the projects will be built.',
      'debug'
    )
    .option(
      '-a, --clean-all',
      'Specifies that we should delete any build output on all build modes.'
    )
    .option(
      '-c, --clean',
      'Specifies that we should delete any build output on the current build mode.'
    )
    .option(
      '-b, --build',
      'Specifies that we should build the projects specified.'
    )
    .option('-r, --run', 'Specifies that we should run the project specified.')
    .parse(process.argv);

  if (!compilerProfiles[commander.compilerProfile]) {
    console.warn(
      "Warning: Unsupported compiler profile found. Defaulting to 'g++'..."
    );
    commander.compilerProfile = 'g++';
  }

  const options = {};
  if (commander.dev) options.dev = commander.dev;
  options.compilerProfile = compilerProfiles[commander.compilerProfile];
  options.projects = commander.projects;
  options.buildMode = commander.buildMode;
  if (commander.cleanAll) options.cleanAll = commander.cleanAll;
  if (commander.clean) options.clean = commander.clean;
  if (commander.build) options.build = commander.build;
  if (commander.run) options.run = commander.run;
  return options;
};
