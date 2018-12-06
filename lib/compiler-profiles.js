/**
 * @file lib/compiler-profiles.js
 * Contains the profiles of C/C++ compilers supported by this build system.
 */

module.exports = {
  'g++': require('./profiles/g++'),
  gcc: require('./profiles/gcc')
};
