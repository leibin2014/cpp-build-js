/**
 * @file lib/utils.js
 * A collection of miscalleanous utility functions.
 */

// Imports
const path = require('path');
const fs = require('fs');
const sep = path.sep;

/**
 * A version of Array.forEach that works with async/await functions.
 * @param {any[]} array The array to be worked on.
 * @param {function} callable The async/await function to be run on each element.
 */
const asyncForEach = async (array, callable) => {
  for (let i = 0; i < array.length; ++i) {
    await callable(array[i], i, array);
  }
};

/**
 * Gets all immediate subdirectories in the given directory.
 * @param {string} dir The directory to scan.
 * @return {string[]} The directory's subfolders.
 */
const getSubdirectories = dir => {
  // The array of subdirectories.
  const subdirectories = [];

  // Get the list of the directory's contents.
  const contents = fs.readdirSync(dir);

  // Iterate through our list of contents and look for directories.
  contents.forEach(c => {
    if (c[0] !== '.') {
      const filePath = [dir, c].join(sep);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory() === true) {
        subdirectories.push(c);
      }
    }
  });

  // Return our subdirectories.
  return subdirectories;
};

/**
 * Fixes the given directory path by replacing all directory separators
 * therein with the correct, OS-specific separator.
 * @param {string} dir The path to fix.
 * @param {boolean} resolve Resolve the absolute path, too?
 * @return {string} The resolved path.
 */
const fixDirectory = (dir, resolve = true) => {
  const replaced = dir.replace(/\/|\\/g, sep);
  if (path.isAbsolute(replaced) === true || resolve === false) {
    return replaced;
  } else {
    return path.resolve(replaced);
  }
};

/**
 * Creates an output filename based on the target and build output mode given.
 * @param {string} target The target to be resolved.
 * @param {string} output The build output mode: 'executable', 'static-library', or 'shared-library'
 * @return {string} The resolved output filename.
 */
const createOutputFilename = (target, output) => {
  target = target.replace(/-([a-z])/g, g => g[1].toUpperCase());

  const platform = process.platform;
  let extension = '';
  let returnTarget = '';
  if (output === 'executable') {
    returnTarget = target;
    if (platform === 'win32') extension = '.exe';
  } else if (output === 'static-library') {
    target = target[0].toUpperCase() + target.substring(1);
    returnTarget = `lib${target}`;
    if (platform === 'win32') extension = '.lib';
    else extension = '.a';
  } else if (output === 'shared-library') {
    target = target[0].toUpperCase() + target.substring(1);
    returnTarget = `lib${target}`;
    if (platform === 'win32') extension = '.dll';
    else extension = '.so';
  }

  return `${returnTarget}${extension}`;
};

module.exports = {
  asyncForEach,
  getSubdirectories,
  fixDirectory,
  createOutputFilename
};
