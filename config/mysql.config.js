const fs = require('fs');
const path = require('path');

module.exports = {
  HOST: process.env.MYSQL_HOST || "private-steamless-db-do-user-16647494-0.c.db.ondigitalocean.com",
  PORT: process.env.MYSQL_PORT || "25060",
  USERNAME: process.env.MYSQL_USERNAME || "services",
  PASSWORD: process.env.MYSQL_PASSWORD || "AVNS_eyVu7bTpzuYS8QVN8JO",
  DATABASE: process.env.MYSQL_DATABASE || "gaming_schema",
  CONNECTION_LIMIT: process.env.MYSQL_CONNECTION_LIMIT ?
    parseInt(process.env.MYSQL_CONNECTION_LIMIT) : 10,
  QUEUE_LIMIT: process.env.MYSQL_QUEUE_LIMIT ?
    parseInt(process.env.MYSQL_QUEUE_LIMIT) : 0,
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, "../config/ca-certificate.crt"))
  }
};