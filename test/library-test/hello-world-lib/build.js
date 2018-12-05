module.exports = {
  debug: {
    includeDirectories: ['./include'],
    sourceFiles: ['hello/greet.cpp'],
    buildOutput: 'shared-library',
    defines: ['_hello_building']
  }
};
