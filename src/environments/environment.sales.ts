import config from '../app/auth_config_sales.json';

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
    ...(audience && audience !== 'https://go-manage-testing.eu.auth0.com/' ? { audience } : null),
    redirectUri: window.location.origin,
    errorPath,
    apiUri,
  },
  httpInterceptor: {
    allowedList: [`${apiUri}/*`],
  },
};
