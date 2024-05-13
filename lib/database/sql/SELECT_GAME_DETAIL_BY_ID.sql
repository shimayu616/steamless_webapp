SELECT
    steam_appid, name,short_description, header_image, categories,genres,release_date,required_age,positive_ratings,negative_ratings,average_playtime,price,released_month,released_year,released_day, publisher, developer
FROM updated_steam_game_data
WHERE steam_appid = ?
;