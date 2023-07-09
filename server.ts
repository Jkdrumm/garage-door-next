require('module-alias/register');
import type { NextConfig } from 'next';
import type { Server } from 'https';
import type { Dirent } from 'fs';
import type { Request, Response } from 'express';

import http from 'http';
import https from 'https';
import { readFileSync, readdirSync } from 'fs';
import next from 'next';
import express from 'express';
import { parse } from '@godd/certificate-parser';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import dotenv from 'dotenv';
dotenv.config();

import {
  DatabaseService,
  DnsService,
  GarageDoorService,
  LogService,
  OpenSslService,
  SettingsService,
  UsersService,
  VersionService,
  WebSocketService,
} from './src/services';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  env: {},
  experimental: { newNextLinkBehavior: false, appDir: false },
  webpack: config => {
    if (!config.resolve.plugins) {
      config.resolve.plugins = [];
    }
    config.resolve.plugins.push(new TsconfigPathsPlugin());
    return config;
  },
};

const ports = {
  http: 80,
  https: 443,
};

const dev = process.env.NODE_ENV === 'development';
const app = next({ dev, dir: __dirname, conf: nextConfig });

// Load services
DatabaseService.getInstance();
DnsService.getInstance();
GarageDoorService.getInstance();
LogService.getInstance();
OpenSslService.getInstance();
SettingsService.getInstance();
UsersService.getInstance();
VersionService.getInstance();
WebSocketService.getInstance();

const handle = app.getRequestHandler();
const server = express();
let httpsServer: Server;

let enableHttps = false;
const options: { cert: string; ca: string; key: string } = {
  cert: '',
  ca: '',
  key: '',
};

function loadOptions() {
  const directories = readdirSync('.config/greenlock/live/', { withFileTypes: true }).filter((dirent: Dirent) =>
    dirent.isDirectory(),
  );
  const { name: domainName } = directories[0];
  if (directories.length !== 0) {
    enableHttps = true;
    options.cert = readFileSync(`.config/greenlock/live/${domainName}/cert.pem`).toString();
    options.ca = readFileSync(`.config/greenlock/live/${domainName}/bundle.pem`).toString();
    options.key = readFileSync(`.config/greenlock/live/${domainName}/privkey.pem`).toString();
    const parsedCertificate = parse(options.cert as any);
    setCertificateRenewalTimeout(parsedCertificate.validTo.toString());
  } else enableHttps = false;
}

function setCertificateRenewalTimeout(endDateString: string) {
  const endDate = new Date(endDateString).valueOf();
  const now = new Date().valueOf();
  const millisecondsUntilExpiration = endDate - now;
  // Give an extra day of buffer
  const millisecondsUntilRenewall = millisecondsUntilExpiration - 8640000;
  global.certificateRefreshTime = millisecondsUntilRenewall;
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
    .on('error', (err: Error) => console.error(err))
    // Restart on crash
    .on('close', startHttps);
  global.httpsStarted = true;
}

function startHttp() {
  http
    .createServer(server)
    .listen(ports.http)
    .on('error', (err: Error) => console.error(err))
    // Restart on crash
    .on('close', startHttp);
}

global.httpsStarted = false;
global.startHttps = function () {
  loadOptions();
  if (enableHttps) startHttps();
};

const localDomains = dev ? ['localhost'] : ['localhost', '.local'];

// The NEXTAUTH_SECRET has to be loaded before the next.js server starts
SettingsService.getInstance()
  .getNextAuthSecretAsync()
  .then(() =>
    app
      .prepare()
      .then(() => {
        server.all('*', (req: Request, res: Response) => {
          const {
            headers: { host },
            url,
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
            host &&
            !localDomains.some(domain => host.toLowerCase().endsWith(domain)) &&
            !/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(host)
          )
            res.redirect('https://' + host + url);
          else handle(req, res);
        });
        startHttp();
        if (enableHttps) startHttps();
      })
      .catch(console.error),
  );

global.completeUpdate = function completeUpdate() {
  process.exit();
};
