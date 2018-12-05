/**
 * @file lib/project.js
 * Function for processing a project.
 */

// Imports
const path = require('path');
const fs = require('fs');
const utils = require('./utils');
const Build = require('./build');

/**
 * Processes the given project.
 * @param {string} name The given project's name.
 * @param {object} options The program's command-line options.
 */
const processProject = async (name, options) => {
  // Look for a file named 'build.js' in the project's folder.
  const projectBuildFile = utils.fixDirectory(`./${name}/build.js`);

  // Check to see if that file exists.
  if (fs.existsSync(projectBuildFile) === true) {
    // Require that project file as a module.
    const project = require(projectBuildFile);

    // Make sure a build schema exists for the given build mode.
    if (project[options.buildMode]) {
      process.chdir(`./${name}`);
      const build = new Build(name, project[options.buildMode], options);

      if (options.cleanAll) {
        build.cleanAll();
      } else if (options.clean) {
        build.clean();
      }

      if (options.build) {
        await build.compile();
        await build.link();
      }

      if (options.run) {
        await build.run();
      }
      process.chdir(`..`);
    } else {
      throw new Error(
        `Build schema '${
          options.buildMode
        }' not found in '${projectBuildFile}'!`
      );
    }
  } else {
    throw new Error(`Build file '${projectBuildFile}' not found!`);
  }
};

module.exports = processProject;
