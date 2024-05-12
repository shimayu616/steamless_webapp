const MAX_ITEMS_PER_PAGE = require("../config/application.config.js").search.MAX_ITEMS_PER_PAGE;
const router = require("express").Router();
const { MySQLClient, sql } = require("../lib/database/client.js");

router.get("/", async (req, res, next) => {
  var page = req.query.page ? parseInt(req.query.page) : 1;
  var keyword = req.query.keyword || "";
  var count, results;

  try {
    if (keyword) {
      count = (await MySQLClient.executeQuery(
        await sql("COUNT_GAME_BY_NAME"),
        [`%${keyword}%`]
      ))[0].count;
      results = await MySQLClient.executeQuery(
        await sql("SELECT_GAME_LIST_BY_NAME"),
        [
          `%${keyword}%`,
          (page - 1) * MAX_ITEMS_PER_PAGE,  // offset
          MAX_ITEMS_PER_PAGE                // limit
        ]
      );
    } else {
      count = MAX_ITEMS_PER_PAGE;
      results = await MySQLClient.executeQuery(
        await sql("SELECT_GAME_HIGH_AVERAGE_LIST"),
        [MAX_ITEMS_PER_PAGE]
      );
    }

    res.render("./search/list.ejs", {
      keyword,
      count,
      results,
      pagenation: {
        max: Math.ceil(count / MAX_ITEMS_PER_PAGE),
        current: page
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;