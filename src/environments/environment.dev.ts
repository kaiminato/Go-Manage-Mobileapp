// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import config from '../app/auth_config_dev.json';

const { domain, clientId, audience, apiUri, errorPath } = config as {
  domain: string;
  clientId: string;
  audience?: string;
  apiUri: string;
  errorPath: string;
};

export const environment = {
  production: false,

  auth: {
    domain,
    clientId,
    ...(audience && audience !== 'https://dev-3h98vtcx.us.auth0.com/' ? { audience } : null),
    redirectUri: window.location.origin,
    errorPath,
    apiUri,
  },
  httpInterceptor: {
    allowedList: [`${apiUri}/*`],
  },
};
