const http = require('http');
const https = require('https');
const { readFileSync, readdirSync } = require('fs');
const next = require('next');
const express = require('express');
const { MongoClient } = require('mongodb');
const openssl = require('openssl-nodejs');
const { parse } = require('@godd/certificate-parser');

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

function loadOptions() {
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
    const parsedCertificate = parse(options.cert);
    setCertificateRenewalTimeout(parsedCertificate.validTo);
  } else enableHttps = false;
}

function setCertificateRenewalTimeout(endDateString) {
  const endDate = new Date(endDateString);
  const now = new Date();
  const millisecondsUntilExpiration = endDate - now;
  // Give an extra day of buffer
  const millisecondsUntilRenewall = millisecondsUntilExpiration - 8640000;
  global.certificateRefreshTime = millisecondsUntilRenewall;
}

async function getSecret() {
  const client = await MongoClient.connect(`mongodb://${process.env.MONGODB_URI}`);
  const db = client.db();
  const settings = await db.collection('settings').findOne();
  if (settings && settings.nextAuthSecret) {
    global.NEXTAUTH_SECRET = settings.nextAuthSecret;
    client.close();
  } else {
    let resolver;
    let rejector;
    const returnPromise = (resolve, reject) => {
      resolver = resolve;
      rejector = reject;
    };
    openssl('openssl rand -base64 32', async (err, buffer) => {
      const error = err.toString();
      if (error) rejector(error);
      else {
        this.rand = buffer.toString();
        // Save secret
        await db.collection('settings').updateOne({}, { $set: { nextAuthSecret: this.rand } }, { upsert: true });
        client.close();
        resolver();
      }
    });
    return returnPromise;
  }
}

try {
  loadOptions();
  // eslint-disable-next-line no-empty
} catch {}

function startHttps() {
  if (httpsServer) {
    httpsServer.removeAllListeners();
    httpsServer.close();
  }
  httpsServer = https
    .createServer(options, server)
    .listen(ports.https)
    .on('error', err => console.error(err))
    // Restart on crash
    .on('close', startHttps);
  global.httpsStarted = true;
}

function startHttp() {
  http
    .createServer(server)
    .listen(ports.http)
    .on('error', err => console.error(err))
    // Restart on crash
    .on('close', startHttp);
}

global.httpsStarted = false;
global.startHttps = function () {
  loadOptions();
  if (enableHttps) startHttps();
};

const localDomains = process.env.NODE_ENV === 'production' ? ['localhost', '.local'] : ['localhost'];

// The NEXTAUTH_SECRET has to be loaded before the next.js server starts
getSecret().then(() =>
  app
    .prepare()
    .then(() => {
      server.all('*', (req, res) => {
        const {
          headers: { host },
          url
        } = req;
        /**
         * Redirect to HTTPS if meeting all 4 conditions
         * 1. Attempting to access over HTTP
         * 2. HTTPS server is configured
         * 3. Not accesing over local domain names
         * 4. Not accessing using an IP address
         */
        if (
          !req.secure &&
          enableHttps &&
          !localDomains.some(domain => host?.toLowerCase().endsWith(domain)) &&
          !/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(host)
        )
          res.redirect('https://' + host + url);
        else handle(req, res);
      });
      startHttp();
      if (enableHttps) startHttps();
    })
    .catch(error => console.error(error))
);

global.completeUpdate = function completeUpdate() {
  process.exit();
};
