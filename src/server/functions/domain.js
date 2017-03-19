const http = require('http');
const UA = require('../user-agents')();
const log = require('./log');

let domain = null;
let getDomain = () => {
      if (domain)
          return domain;

      return new Promise((resolve, reject) => {
          let initialDomain = 'zfilm-hd.net';
          let newDomain = null;
          let headers = {
              'User-Agent': UA
          };

          http.get({
              port: 80,
              host: initialDomain,
              path: '/',
              method: 'GET',
              headers
          }, response => {
              log(`Checking domain... Current: ${initialDomain}`);

              if (newDomain = response.headers.location) {
                  domain = newDomain.match(/http:\/\/([^\/]+)/i)[1];
                  resolve(domain);

                  log(`Found new domain: ${domain}`);
                  return;
              }

              log(`Domain is still same.`);
              domain = initialDomain;
              resolve(domain);
          }).on('error', reject);
      });
};

module.exports = getDomain;