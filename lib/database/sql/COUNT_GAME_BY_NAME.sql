SELECT
    count(*) as count
FROM
    updated_steam_game_data
WHERE
    name LIKE ?;