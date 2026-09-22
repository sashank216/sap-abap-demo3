const cds = require('@sap/cds');
const express = require('express');
const path = require('path');

cds.on('bootstrap', app => {
  app.get('/', (_req, res) => res.redirect('/salesorders/webapp/index.html'));
  app.use('/salesorders', express.static(path.join(__dirname, '..', 'app', 'salesorders', 'webapp')));
});

module.exports = cds.server;
