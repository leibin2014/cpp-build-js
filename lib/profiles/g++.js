/**
 * @file lib/profiles/g++.js
 * The compiler profile for GNU's C++ compiler.
 */

const compileCommand = (source, object, options) => {
  // Program and Initial Flags
  const program = 'g++';
  const flags = ['-Wall', '-Werror', '-c'];

  // Additional Flags
  if (options.buildOutput === 'shared-library') flags.unshift('-fPIC');
  if (options.isDebugMode === true) flags.push('-g');

  // Define Flags
  const defines = options.defines || [];
  const defineFlags = defines.map(d => `-D${d}`);

  // Include Flags - The include directories should already be resolved.
  const includes = options.includes || [];
  const includeFlags = includes.map(i => `-I${i}`);

  // Output Flag
  const outputFlag = '-o';

  // Return an object with the program name and the combined list of arguments
  // as an array to be passed into our spawner function.
  return {
    program,
    args: [
      ...flags,
      ...defineFlags,
      ...includeFlags,
      source,
      outputFlag,
      object
    ]
  };
};

const executableLinkCommand = (objects, target, options) => {
  const program = 'g++';

  const libraryPaths = options.libraryPaths || [];
  const libraryFlags = libraryPaths.map(l => `-L${l}`);

  const linkLibraries = options.linkLibraryFlags || [];
  const linkLibraryFlags = linkLibraries.map(l => `-l${l}`);

  const outputFlag = '-o';

  return {
    program,
    args: [...objects, ...libraryFlags, ...linkLibraryFlags, outputFlag, target]
  };
};

const staticLinkCommand = (objects, target, options) => {
  const program = 'ar';
  const flags = ['rcs'];

  return {
    program,
    args: [...flags, target, ...objects]
  };
};

const dynamicLinkCommand = (objects, target, options) => {
  const program = 'g++';
  const flags = ['-shared'];

  const libraryPaths = options.libraryPaths || [];
  const libraryFlags = libraryPaths.map(l => `-L${l}`);

  const linkLibraries = options.linkLibraryFlags || [];
  const linkLibraryFlags = linkLibraries.map(l => `-l${l}`);

  const outputFlag = '-o';

  return {
    program,
    args: [
      ...flags,
      ...objects,
      ...libraryFlags,
      ...linkLibraryFlags,
      outputFlag,
      target
    ]
  };
};

module.exports = {
  compileCommand,
  executableLinkCommand,
  staticLinkCommand,
  dynamicLinkCommand
};
