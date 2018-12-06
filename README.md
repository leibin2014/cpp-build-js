# CPPBuild.JS - C/C++ Build Scripts in Javascript

## Introduction

This is a command-line application that will allow C and C++ developers to write application build scripts in Javascript. These build scripts can take advantage of the Node.JS runtime environment. This is intended to be an alternative to other build systems like GNU Make and CMake.

## Installation

You will need Node.JS installed on your system, and this section assumes that you have already installed it. If you haven't installed it yet, [click here and follow the directions to install Node.JS.](https://nodejs.org)

Open a Terminal/Command Prompt and issue the following command:

```bash
# This will install the package globally, so you can use it across your whole system.
npm install -g cpp-build-js
```

NOTE: For Windows users, you may need to add the path to your NPM executable to your PATH variable, or use the special Node.JS Command Prompt that comes with your Node.JS installation.

## Usage

```
  cpp-build [--dev] [--clean-all|--clean] [--compiler-profile=g++] [--projects=list,of,projects] [--build] [--run]
```

### Arguments

`-V, --version`

Outputs the current version number.

`-d, --dev`

Runs the application in development mode. At this moment, all this flag does is show an error stack if something goes wrong.

`-c, --compiler-profile [compiler profile]`

Specifies a _compiler profile_ for CPPBuild.JS to use for your project. Defaults to `g++`, GNU's C++ compiler. More compiler profiles, like MSVC or Clang, will be supported at a future date.

`-p, --projects [list of projects]`

Specifies a comma-separated list of projects. These projects will be processed in the order specified. If this flag is not provided, then CPPBuild.JS will look for a _solution file_ containing the list of projects to be processed. More on that later.

`-m, --build-mode [build mode]`

Specifies a _build mode_, which dictates how the project will be built. Many projects will have multiple build modes for multiple builds. For instance, the `debug` build mode could be used for a debug build of your projects. Defaults to `debug`.

`-a, --clean-all` and `-c, --clean`

These flags perform cleanup operations on any pre-existing build output in your projects. The `--clean` flag deletes output files from the current build, as dictated by the `--build-mode` flag.

`-b, --build`

Compiles and links a new build of your projects. The build mode is specified by the `--build-mode` flag.

`-r, --run`

Runs the current build of your projects. A project's `buildOutput` property - more on that later - must be set to `executable` in order for it to run.

`-h, --help`

Displays the above help.

## Folder Structure

In the root directory of your project, CPPBuild.JS expects something similar to the folder structure shown below:

```
root-folder
|-project-one
|--include
|--src
|--build.js
|-project-two
|--include
|--src
|--build.js
|-solution.js
```

## Project Solution

In CPPBuild.JS, a project is actually a collection of one or more projects called a _solution_. Projects in a solution are _processed_ (cleaned, built, and/or run) in the order by which they are specified. Projects in a solution can be specified in one of three ways, in the following order of precedence.

### The `--projects` Flag

In the command line, you can pass the `--projects` flag to specify a comma-separated list of projects to build. Example: `--projects=hello-world-lib,hello-world`

### The `solution.js` File

CPPBuild.JS can look for and `require` a `solution.js` file at the root of your project. This file `module.exports` an object which contains a property called `projects`. This can be an array of projects, or a function that returns an array of projects.

#### Example #1: A `projects` array

```Javascript
module.exports = {
  projects: [
    'hello-world-lib',
    'hello-world'
  ]
};
```

#### Example #2: A `projects` function

```Javascript
module.exports = {
  projects: () => {
    return [
      'hello-world-lib',
      'hello-world'
    ]
  }
}
```

### Scanning Subfolders

If no `--project` flag was given, and no `solution.js` file was found, CPPBuild.JS will scan all immediate subfolders in your project's root directory. Any folders that contain a `build.js` file will be assumed to be projects, and will be processed in the order by which they were scanned.

## Project Build File

A _project_ is a folder inside the solution's root directory that contains source code to be compiled. CPPBuild.JS expects to find a `build.js` file inside the project folder. This file, when `required`'d, will export an object that contains one or more objects that represent different build configurations for different build modes. Consider the example below:

```Javascript
/**
 * @file test/library-test/hello-world-client/build.js
 */

module.exports = {
  debug: {
    includeDirectories: ['../hello-world-lib/include'],
    sourceFiles: ['main.cpp'],
    sharedLibraryDirectories: ['../hello-world-lib/bin/debug'],
    libraryPaths: ['../hello-world-lib/bin/debug'],
    linkLibraryFlags: ['HelloWorldLib']
  }
};
```

Take note of the sole member object inside the exported object. The object's key, `debug`, represents the build mode. If we specify `--mode=debug` when running `cpp-build`, CPPBuild.JS will look inside the `debug` subobject to figure out how to build this particular project.

### Project Build Properties

A project build object can contain the following properties:

#### General Configuration

- `buildOutput` specifies what kind of binary will be built. Can be set to `executable`, `static-library`, or `shared-library`. Default: `executable`.
- `target` specifies the name of the binary file to be created. This name is converted into camel case. Defaults to the project's name, as specified by the solution.

#### Directories

- `includeDirectories` is an array that specifies a list of directories to search for header files in addition to defaults.
- `sourceDirectory` specifies the directory where CPPBuild.JS looks for source files to compile. Default: `./src`.
- `objectDirectory` specifies the directory where compiled object files should be placed. Default: `./obj`.
- `binaryDirectory` specifies the directory where the final binary should be placed. Default: `./bin`.
- `libraryPaths` is an array specifying additional directories to search for link libraries.
- `sharedLibraryDirectories` is an array specifying additional directories to search for shared libraries which are required for an executable to run. When the executable is invoked, these paths will be temporarly added to the `LD_LIBRARY_PATH` environment variable on Linux and other Unix-like operating systems, or to the `PATH` variable on Windows.

#### Files

- `sourceFiles` is an array specifiying the list of source files to be compiled. Files will be compiled in the order specified. File paths are relative to the path set in `sourceDirectory`. This property is required.

#### Flags

- `defines` is an array specifying a list of macros to be defined during the compilation process.
- `linkLibraryFlags` is an array defining a list of libraries to be linked with the project build.
- `targetArgs` is an array of arguments that should be passed into the compiled executable when run.

## What Do You Think?

Let me know what you think about this project. If you have any problems using this tool, feel free to submit an issue and/or make a contribution to the code base. This is very much a work in progress, so any suggestions and improvements would be much appreciated.
