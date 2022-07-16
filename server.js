const http = require('http');
const https = require('https');
const { readFileSync, readdirSync } = require('fs');
const next = require('next');
const express = require('express');

const ports = {
  http: 80,
  https: 443
};

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const server = express();
let httpsServer;

let enableHttps = false;
let options = {};

const loadOptions = () => {
  const directories = readdirSync('.config/greenlock/live/', { withFileTypes: true }).filter(dirent =>
    dirent.isDirectory()
  );
  const { name: domainName } = directories[0];
  if (directories.length !== 0) {
    enableHttps = true;
    options = {
      cert: readFileSync(`.config/greenlock/live/${domainName}/cert.pem`),
      ca: readFileSync(`.config/greenlock/live/${domainName}/bundle.pem`),
      key: readFileSync(`.config/greenlock/live/${domainName}/privkey.pem`)
    };
  } else enableHttps = false;
};

try {
  loadOptions();
  // eslint-disable-next-line no-empty
} catch {}

const startHttps = () => {
  if (httpsServer) httpsServer.close();
  httpsServer = https
    .createServer(options, server)
    .listen(ports.https)
    .on('error', err => console.error(err))
    // Restart on crash
    .on('close', startHttps);
  global.httpsStarted = true;
};

const startHttp = () => {
  http
    .createServer(server)
    .listen(ports.http)
    .on('error', err => console.error(err))
    // Restart on crash
    .on('close', startHttps);
};

global.httpsStarted = false;
global.startHttps = () => {
  loadOptions();
  if (enableHttps) startHttps();
};

app
  .prepare()
  .then(() => {
    server.all('*', (req, res) => handle(req, res));
    startHttp();
    if (enableHttps) startHttps();
  })
  .catch(error => console.error(error));
