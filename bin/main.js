#!/usr/bin/env node

/**
 * @file bin/main.js
 * The CLI entry point for our application.
 */

// Imports
const processCli = require('../lib/process-cli');

// Process command-line arguments.
const cliOptions = processCli();

// Run application.
require('../lib/index')(cliOptions).catch(err => {
  if (cliOptions.dev) {
    console.error(err.stack || err.message);
  } else {
    console.error(err.message);
  }

  process.exit(1);
});
