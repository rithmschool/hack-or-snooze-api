const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_NAME = process.env.DB_NAME || 'hackorsnooze';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_USER = process.env.DB_USER || '';
const DB_PASS = process.env.DB_PASS || '';
const ENV = process.env.NODE_ENV;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'abc123';

const mongoDBConfig = {
  host: DB_HOST,
  name: DB_NAME,
  user: DB_USER,
  pass: DB_PASS,
  port: DB_PORT,
  options: {
    autoIndex: ENV === 'production' ? false : true,
    useMongoClient: true
  }
};

module.exports = {
  ENV,
  JWT_SECRET_KEY,
  mongoDBConfig
};
