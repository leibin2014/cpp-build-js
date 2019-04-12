/**
 * @file lib/build.js
 * A class for managing a single project build.
 */

// Imports
const fs = require('fs');
const rimraf = require('rimraf');
const utils = require('./utils');
const spawn = require('./spawn');

/**
 * A class for managing a single project build.
 */
class Build {
  /**
   * Creates the output directory given. A subfolder within that directory
   * is also created, representing the current build mode.
   * @param {string} dir The output directory to be created.
   */
  _createOutputDirectory(dir) {
    const finalDir = utils.fixDirectory(`${dir}/${this.buildMode}`);
    if (fs.existsSync(dir) === false) {
      fs.mkdirSync(dir);
    }

    if (fs.existsSync(finalDir) === false) {
      fs.mkdirSync(finalDir);
    }
    return finalDir;
  }

  /**
   * Creates an object filename from the given base source file.
   * @param {string} baseSourceFile The name of the unresolved source file.
   */
  _createObjectFilename(baseSourceFile) {
    return baseSourceFile.replace(/\/|\\/g, '.');
  }

  /**
   * The class constructor.
   * @param {string} name The name of the project.
   * @param {object} project The object containing our project schema.
   * @param {object} options The command-line options passed in.
   */
  constructor(name, project, options) {
    // Compiler Profile Configuration
    this.compilerProfile = options.compilerProfile;
	this.compilerProfileGpp = options.compilerProfileGpp;
	this.compilerProfileGcc = options.compilerProfileGcc;

    // General Project Configuration
    this.projectName = name;
    this.buildOutput = project.buildOutput || 'executable';
    this.buildMode = options.buildMode;

    // Specify the relative folders in our build environment.
    this.baseSourceDirectory = project.sourceDirectory || './src';
	this.linkscriptDirectory = project.linkscriptDirectory || './linkscript';
    this.baseObjectDirectory = project.objectDirectory || './obj';
    this.baseBinaryDirectory =
      project.binaryDirectory ||
      (this.buildOutput === 'static-library' ? './lib' : './bin');
    this.baseIncludeDirectories = project.includeDirectories || [];

    // Resolve those folders to absolute paths.
    this.sourceDirectory = utils.fixDirectory(this.baseSourceDirectory, true);
	this.linkscriptDirectory = utils.fixDirectory(this.linkscriptDirectory, true);
    this.objectDirectory = utils.fixDirectory(this.baseObjectDirectory, true);
    this.binaryDirectory = utils.fixDirectory(this.baseBinaryDirectory, true);
    this.includeDirectories = this.baseIncludeDirectories.map(d =>
      utils.fixDirectory(d, true)
    );

    // Specify our defines.
    this.baseDefines = project.defines || [];
    this.defines = this.baseDefines.map(d => d.toUpperCase());

    // Specify and resolve our source files.
    this.baseSourceFiles = project.sourceFiles || [];
    if (this.baseSourceFiles.length === 0) {
      throw new Error(
        `No source files found in project '${this.projectName}'!`
      );
    }

    this.baselinkscriptFiles = project.linkscriptFiles || [];
    if (this.baselinkscriptFiles.length === 0) {
      throw new Error(
        `No linkscript files found in project '${this.projectName}'!`
      );
    }
	
    // Keep an array for our compiled object files.
    this.objectFiles = [];

    // Specify our link library paths...
    this.baseLibraryPaths = project.libraryPaths || [];
    this.libraryPaths = this.baseLibraryPaths.map(l =>
      utils.fixDirectory(l, true)
    );

    // ...and our link library flags.
    this.linkLibraryFlags = project.linkLibraryFlags || [];

    // Specify extra directories to search for shared/dynamic-link libraries
    // needed for the executable to run.
    this.baseSharedLibraryDirectories = project.sharedLibraryDirectories || [];
    this.sharedLibraryDirectories = this.baseSharedLibraryDirectories.map(d =>
      utils.fixDirectory(d, true)
    );

    // Specify the target build output.
    this.baseTarget = utils.createOutputFilename(
      project.target || this.projectName,
      this.buildOutput
    );
    this.target = utils.fixDirectory(
      `${this.binaryDirectory}/${this.buildMode}/${this.baseTarget}`
    );

    // For executable targets, run the target with the given arguments.
    this.targetArgs = project.targetArgs || [];
  }

  /**
   * Compiles the source files given in this build.
   */
  async compile() {
    this._createOutputDirectory(this.objectDirectory);
    const compiledObjects = this.baseSourceFiles.map(async source => {
      const objectFilename = this._createObjectFilename(source);
      const objectFile = utils.fixDirectory(
        `${this.objectDirectory}/${this.buildMode}/${objectFilename}.o`
      );
      const sourceFile = utils.fixDirectory(
        `${this.sourceDirectory}/${source}`
      );
	  console.log("source:", source);
	  if (source.indexOf(".cpp") === -1)
	  {
	      var compileCommand = this.compilerProfileGcc.compileCommand(
	        sourceFile,
	        objectFile,
	        {
	          buildOutput: this.buildOutput,
	          isDebugMode: this.buildMode.toLowerCase() === 'debug',
	          defines: this.defines,
	          includes: this.includeDirectories
	        }
	      );
	  }
	  else
	  {
	      var compileCommand = this.compilerProfileGpp.compileCommand(
	        sourceFile,
	        objectFile,
	        {
	          buildOutput: this.buildOutput,
	          isDebugMode: this.buildMode.toLowerCase() === 'debug',
	          defines: this.defines,
	          includes: this.includeDirectories
	        }
	      );
	  }
	  
      await spawn(compileCommand.program, compileCommand.args);
      return objectFile;
    });

    this.objectFiles = await Promise.all(compiledObjects);
  }

  /**
   * Links the object files given from compilation.
   */
  async link() {
    this._createOutputDirectory(this.binaryDirectory);
    let linkCommand = null;
    if (this.buildOutput === 'executable') {
	  const linkscripts = this.baselinkscriptFiles.map(i => {

		  const linkscriptFile = utils.fixDirectory(
	        `${this.linkscriptDirectory}/${i}`
	      );
	      
	      return linkscriptFile;
      });
      linkCommand = this.compilerProfile.executableLinkCommand(
	  	linkscripts,
        this.objectFiles,
        this.target,
        {
          libraryPaths: this.libraryPaths,
          linkLibraryFlags: this.linkLibraryFlags
        }
      );
    } else if (this.buildOutput === 'shared-library') {
      linkCommand = this.compilerProfile.dynamicLinkCommand(
        this.objectFiles,
        this.target,
        {
          libraryPaths: this.libraryPaths,
          linkLibraryFlags: this.linkLibraryFlags
        }
      );
    } else if (this.buildOutput === 'static-library') {
      linkCommand = this.compilerProfile.staticLinkCommand(
        this.objectFiles,
        this.target
      );
    } else {
      throw new Error(
        `Invalid build output for project '${this.projectName}'!`
      );
    }

    await spawn(linkCommand.program, linkCommand.args);
  }

  /**
   * Runs the executable target.
   */
  async run() {
    if (this.buildOutput !== 'executable') {
      return;
    }

    if (process.platform === 'win32') {
      process.env.PATH += `;${this.sharedLibraryDirectories.join(';')}`;
    } else {
      process.env.LD_LIBRARY_PATH += `:${this.sharedLibraryDirectories.join(
        ':'
      )}`;
    }

    await spawn(this.target, this.targetArgs);
  }

  /**
   * Cleans the build output on the current build mode.
   */
  clean() {
    rimraf.sync(`${this.objectDirectory}/${this.buildMode}`);
    rimraf.sync(`${this.binaryDirectory}/${this.buildMode}`);
  }

  /**
   * Cleans the build output on all build modes.
   */
  cleanAll() {
    rimraf.sync(`${this.objectDirectory}`);
    rimraf.sync(`${this.binaryDirectory}`);
  }
}

module.exports = Build;
