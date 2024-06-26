const appconfig = require("./config/application.config.js");
const dbconfig = require("./config/mysql.config.js");
const path = require("path");
const logger = require("./lib/log/logger.js");
const accesslogger = require("./lib/log/accesslogger.js");
const applicationlogger = require("./lib/log/applicationlogger.js");
const express = require("express");
const cookie = require("cookie-parser");
const session = require("express-session");
const MySqlStore = require("express-mysql-session")(session);
const app = express();

// Express settings
app.set("view engine", "ejs");
app.disable("x-powered-by");

// Expose global method to view engine.
app.use((req, res, next) => {
  res.locals.moment = require("moment");
  res.locals.padding = require("./lib/math/math.js").padding;
  next();
});

// Static resource rooting.
app.use("/public", express.static(path.join(__dirname, "/public")));

// Set access log.
app.use(accesslogger());

// Set middleware
app.use(cookie());
app.use(session({
  store: new MySqlStore({
    host: dbconfig.HOST,
    port: dbconfig.PORT,
    user: dbconfig.USERNAME,
    password: dbconfig.PASSWORD,
    database: dbconfig.DATABASE,
    ssl: dbconfig.ssl,
    rejectUnauthorized: true
  }),
  secret: appconfig.security.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  name: "sid"
}));
app.use(express.urlencoded({ extended: true }));

// Dynamic resource rooting.
app.use("/account", require("./routes/account.js"));
app.use("/search", require("./routes/search.js"));
app.use("/games", require("./routes/games.js"));
app.use("/", require("./routes/index.js"));

// Set application log.
app.use(applicationlogger());

// Execute web application.
app.listen(appconfig.PORT, () => {
  logger.application.info(`Application listening at :${appconfig.PORT}`);
});
