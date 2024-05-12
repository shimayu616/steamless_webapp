UPDATE
    game_score
SET
  score = (
    SELECT round(avg(score), 2) FROM t_review WHERE steam_appid = ?
  )
WHERE
  steam_appid = ?
