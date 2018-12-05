/**
 * @file lib/spawn.js
 * Function for spawning a process.
 */

// Imports
const childProcess = require('child_process');

/**
 * Spawns a process and awaits a return code.
 * @param {string} command The name of the process to spawn.
 * @param {string[]} args An array of arguments to pass to the process.
 * @param {object} env The environment variables to set for the process.
 * @return {Promise} A promise that resolves or rejects when the process ends.
 */
const spawn = (command, args = [], env = {}) => {
  const log = { stdout: '', stderr: '' };
  const envVars = { ...process.env, ...env };

  return new Promise((resolve, reject) => {
    try {
      const proc = childProcess.spawn(command, args, {
        env: envVars,
        windowsHide: true
      });

      proc.stdout.on('data', data => {
        log.stdout += data.toString();
        console.log(data.toString());
      });

      proc.stderr.on('data', data => {
        log.stderr += data.toString();
        console.error(data.toString());
      });

      proc.on('close', code => {
        if (code === 0) {
          return resolve({
            stdout: log.stdout,
            stderr: log.stderr
          });
        } else {
          return reject({
            message: `Process '${command}' exited with code ${code}!`,
            stdout: log.stdout,
            stderr: log.stderr
          });
        }
      });
    } catch (err) {
      return reject({
        message: `Error spawning process '${command}': ${err}`
      });
    }
  });
};

module.exports = spawn;
