module.exports = {
  debug: {
    includeDirectories: ['../hello-world-lib/include'],
    sourceFiles: ['main.cpp'],
    sharedLibraryDirectories: ['../hello-world-lib/bin/debug'],
    libraryPaths: ['../hello-world-lib/bin/debug'],
    linkLibraryFlags: ['HelloWorldLib']
  }
};
