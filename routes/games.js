const router = require("express").Router();
const { MySQLClient, sql } = require("../lib/database/client.js");

router.get("/:steam_appid", async (req, res, next) => {
  var steam_appid = req.params.steam_appid;

  Promise.all([
    MySQLClient.executeQuery(
      await sql("SELECT_GAME_DETAIL_BY_ID"),
      [steam_appid]
    ),
    MySQLClient.executeQuery(
      await sql("SELECT_GAME_REVIEW_BY_GAME_ID"),
      [steam_appid]
    ),
    MySQLClient.executeQuery(await sql("SELECT_GAME_RANDOM"), [2])
  ]).then((results) => {
    var data = results[0][0];
    data.reviews = results[1] || [];
    data.recommendedGames = results[2] || [];
    res.render("./games/index.ejs", data);
  }).catch((err) => {
    next(err);
  });
});

module.exports = router;