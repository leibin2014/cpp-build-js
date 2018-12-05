/**
 * @file lib/solution.js
 * Process a solution of projects in our current working directory.
 */

// Imports
const path = require('path');
const fs = require('fs');
const processProject = require('./process-project');
const utils = require('./utils');

/**
 * Processes the current working directory for a collection of projects,
 * known as a solution.
 * @param {object} options Our command-line options.
 */
const processSolution = async options => {
  // First, resolve the path to the local 'solution.js' file. We may or may
  // not need it.
  const solutionFile = path.resolve('solution.js');

  // When it comes to scanning for projects to build, we will follow the
  // following chain of precedence:
  //
  // 1. If a comma-separated list of projects is given by '--projects',
  //    then scan them.
  // 2. If a 'solution.js' file is found, scan for projects from the 'projects'
  //    array exported in that solution object.
  // 3. If '--projects' is not specified, and a 'solution.js' file is not found,
  //    then scan all directories in the current working directory for projects.
  let projects = null;
  if (options.projects) {
    // Separate the string by comma and store the projects here.
    projects = options.projects.split(',');
  } else if (fs.existsSync(solutionFile) === true) {
    // Require the solution file as a module.
    const solution = require(solutionFile);

    // The 'projects' member in the resulting object can either be an array
    // or a function which returns an array. In the latter case, our command-line
    // options can be passed in as a parameter.
    if (typeof solution.projects === 'function') {
      projects = solution.projects(options);
    } else if (
      Array.isArray(solution.projects) &&
      solution.projects.length > 0
    ) {
      projects = solution.projects;
    } else {
      throw new Error(`No projects found in solution file '${solutionFile}'!`);
    }
  } else {
    // Get all subfolders in the current working directory.
    projects = utils.getSubdirectories('.');
  }

  // Filter out all project folder candidates which do not have a 'build.js'
  // build script file present.
  projects = projects.filter(p =>
    fs.existsSync(utils.fixDirectory(`./${p}/build.js`))
  );

  // Do not continue if no projects were found.
  if (projects.length === 0) {
    throw new Error(`No projects found!`);
  }

  // Iterate over and process each project.
  await utils.asyncForEach(projects, async project => {
    await processProject(project, options);
  });
};

module.exports = processSolution;
