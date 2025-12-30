/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });
console.log('hasToken', Boolean(process.env.BLOB_READ_WRITE_TOKEN));
console.log((process.env.BLOB_READ_WRITE_TOKEN || '').slice(0, 25));
