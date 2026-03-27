const express = require('express');
const serverless = require('serverless-http');

const app = require('../server.js');
const handler = serverless(app);

module.exports = handler;

