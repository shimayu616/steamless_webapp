SELECT
  *
FROM
    updated_steam_game_data
WHERE
  steam_appid = ?
FOR UPDATE
