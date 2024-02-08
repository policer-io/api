import dotenv from 'dotenv'
dotenv.config()

// export env variables or defaults
export const {
  NODE_ENV = 'development',
  PORT = '5000',
  OPS_ENV = 'local',
  npm_package_version = '0.0.0',
  DB_URI = 'mongodb://mongodb:mongodb@localhost:27017/pharmassist?authSource=admin',
  LOGGER_LEVEL, // One of 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'
  CORS_REGEX, // = '^https:\\/\\/((([0-9a-zA-Z-]*)\\.)+(?!a-zA-Z0-9-))?embrio\\.tech$',
  // DB_URI = 'mongodb://root:mysecret@localhost:27017/blender?authSource=admin',
  SESSION_KEY_BASE64, // generate with './node_modules/@fastify/secure-session/genkey.js | base64'
  GCP_SVC_ACC_KEY_BASE64 = undefined,
  GCP_STORAGE_BUCKET_NAME,
  APP_API_KEY,
  IMGPROXY_KEY,
  IMGPROXY_SALT,
  IMGPROXY_URL,
  IDENTITY_APP_ID = '44e2c063-e39b-4c63-a834-614be5e09dda',
  IDENTITY_API_URL = 'http://identity:9011',
  IDENTITY_API_KEY,
  STAGE_DNS_NAME = 'localhost',
  HCI_ORGID,
  HCI_APIKEY,
  HCI_ORG = 'EMBRIO GmbH',
  HCI_DOC_URL = 'https://documedis.hcisolutions.ch/2020-01/api',
  HCI_CDS_URL = 'https://int.ce.documedis.hcisolutions.ch/cds/2021-01/api',
} = process.env
