import config from '../app/auth_config_prod_louise.json';

const { domain, clientId, audience, apiUri, errorPath } = config as {
  domain: string;
  clientId: string;
  audience?: string;
  apiUri: string;
  errorPath: string;
};

export const environment = {
  production: true,
  AWS_ACCESS_KEY: "AKIASUBES4CYHO7XXOP3",
  AWS_SECRET_KEY: "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",
  AWS_S3_BUCKET_NAME: "gomanage.image.storage",
  AWS_REGION: "eu-west-1",

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
