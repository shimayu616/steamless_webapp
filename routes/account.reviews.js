const router = require("express").Router();
const { MySQLClient, sql } = require("../lib/database/client.js");
const moment = require("moment");
const tokens = new (require("csrf"))();
const DATE_FORMAT = "YYYY/MM/DD";

var validateReviewData = function (req) {
  var body = req.body;
  var isValid = true, error = {};

  if (body.visit && !moment(body.visit, DATE_FORMAT).isValid()) {
    isValid = false;
    error.visit = "date invalid";
  }

  if (isValid) {
    return undefined;
  }
  return error;
};

var createReviewData = function (req) {
  var body = req.body, date;

  return {
    steam_appid: req.params.steam_appid,
    score: parseFloat(body.score),
    visit: (date = moment(body.visit, DATE_FORMAT)) && date.isValid() ? date.toDate() : null,
    post: new Date(),
    description: body.description
  };
};

router.get("/regist/:steam_appid(\\d+)", async (req, res, next) => {
  var steam_appid = req.params.steam_appid;
  var secret, token, game, gameName, review, results;

  secret = await tokens.secret();
  token = tokens.create(secret);
  req.session._csrf = secret;
  res.cookie("_csrf", token);

  try {
    results = await MySQLClient.executeQuery(
      await sql("SELECT_GAME_BASIC_BY_ID"),
      [steam_appid]
    );
    game = results[0] || {};
    gameName = game.name;
    review = {};
    res.render("./account/reviews/regist-form.ejs", { steam_appid, gameName, review });
  } catch (err) {
    next(err);
  }
});

router.post("/regist/:steam_appid(\\d+)/", async (req, res, next) => {
  var review = createReviewData(req);
  var { steam_appid, gameName } = req.body;
  res.render("./account/reviews/regist-form.ejs", { steam_appid, gameName, review });
});

router.post("/regist/confirm/", (req, res, next) => {
  var error = validateReviewData(req);
  var review = createReviewData(req);
  var { steam_appid, gameName } = req.body;

  if (error) {
    res.render("./account/reviews/regist-form.ejs", { error, steam_appid, gameName, review });
    return;
  }

  res.render("./account/reviews/regist-confirm.ejs", { steam_appid, gameName, review });
});

router.post("/regist/execute", async (req, res, next) => {
  var secret = req.session._csrf;
  var token = req.cookies._csrf;

  if (tokens.verify(secret, token) === false) {
    next(new Error("Invalid Token."));
    return;
  }

  var error = validateReviewData(req);
  var review = createReviewData(req);
  var { steam_appid, gameName } = req.body;
  var userId = "1";
  var transaction;

  if (error) {
    res.render("./account/reviews/regist-form.ejs", { error, steam_appid, gameName, review });
    return;
  }

  try {
    transaction = await MySQLClient.beginTransaction();
    transaction.executeQuery(
      await sql("SELECT_GAME_BY_ID_FOR_UPDATE"),
      [steam_appid]
    );
    transaction.executeQuery(
      await sql("INSERT_GAME_REVIEW"),
      [steam_appid, userId, review.score, review.visit, review.description]
    );
    transaction.executeQuery(
      await sql("UPDATE_GAME_SCORE_BY_ID"),
      [steam_appid, steam_appid]
    );
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    next(err);
  }

  delete req.session._csrf;
  res.clearCookie("_csrf");

  res.redirect(`/account/reviews/regist/complete?steam_appid=${steam_appid}`);
});

router.get("/regist/complete", (req, res) => {
  res.render("./account/reviews/regist-complete.ejs", { steam_appid: req.query.steam_appid });
});

module.exports = router;