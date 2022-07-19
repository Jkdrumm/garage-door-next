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
  if (httpsServer) {
    httpsServer.removeAllListeners();
    httpsServer.close();
  }
  httpsServer = https
    .createServer(options, server)
    .removeAllListeners()
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
    .on('close', startHttp);
};

global.httpsStarted = false;
global.startHttps = () => {
  loadOptions();
  if (enableHttps) startHttps();
};

const localDomains = process.env.NODE_ENV === 'production' ? ['localhost', 'raspberrypi.local'] : ['localhost'];

app
  .prepare()
  .then(() => {
    server.all('*', (req, res) => {
      const {
        headers: { host },
        url
      } = req;
      /**
       * Redirect to HTTPS under 4 conditions
       * 1. Attempting to access over HTTP
       * 2. HTTPS server is configured
       * 3. Not accesing over local domain names
       * 4. Not accessing using an IP address
       */
      if (
        !req.secure &&
        enableHttps &&
        !localDomains.includes(host.toLowerCase()) &&
        !/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(host)
      )
        res.redirect('https://' + host + url);
      else handle(req, res);
    });
    startHttp();
    if (enableHttps) startHttps();
  })
  .catch(error => console.error(error));
