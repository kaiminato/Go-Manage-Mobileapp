import config from '../app/auth_config_prod_jade.json';

const { domain, clientId, audience, apiUri, errorPath } = config as {
  domain: string;
  clientId: string;
  audience?: string;
  apiUri: string;
  errorPath: string;
};

export const environment = {
  production: true,

  auth: {
    domain,
    clientId,
    ...(audience && audience !== 'https://go-manage-production.eu.auth0.com/' ? { audience } : null),
    redirectUri: window.location.origin,
    errorPath,
    apiUri,
  },
  httpInterceptor: {
    allowedList: [`${apiUri}/*`],
  },
};
