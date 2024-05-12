SELECT
    steam_appid, name,short_description, header_image, genres, release_date, required_age, positive_ratings, negative_ratings, average_playtime, price
FROM
    updated_steam_game_data
WHERE
        name LIKE ?
    LIMIT ?, ?;