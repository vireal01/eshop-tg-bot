import pg from 'pg';
import dotenv from "dotenv";
dotenv.config({ silent: process.env.NODE_ENV === 'production' });

export default class DataBaseApi {
    static gameTableName = 'Games'
    static favGamesTableName = 'Favorites'
    static favGamesPricesTableName = 'Prices'

    static poolArgs = {
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        port: process.env.PGPORT,
        password: process.env.PGPASSWORD
    }

    static async createGameTableIfNotCreated(isFavTable = false) {
        const tableName = isFavTable ? this.favGamesTableName : this.gameTableName
        const pool = new pg.Pool(this.poolArgs)
        pool.query(
            `CREATE TABLE IF NOT EXISTS ${tableName} (
            nsuid BIGINT PRIMARY KEY,
            url TEXT,
            image_url TEXT,
            title TEXT,
            normalized_title TEXT,
            fs_id TEXT,
            price_has_discount BOOLEAN,
            age_rating_value SMALLINT
        );`, (err, res) => {
            console.log(err, res)
            pool.end()
        })
    }

    static async createGamesPricesTableIfNotCreated() {
        const pool = new pg.Pool(this.poolArgs)
        pool.query(
            `CREATE TABLE IF NOT EXISTS ${this.favGamesPricesTableName} (
            id_and_region TEXT PRIMARY KEY,
            id bigint NOT NULL,
            price_in_usd TEXT,
            discount_price TEXT,
            is_discount BOOLEAN,
            regular_price TEXT,
            local_curency TEXT,
            sale_percent TEXT,
            discount_end_timestamp BIGINT,
            discount_end_date Text,
            county_emoji TEXT,
            region TEXT
        );`, (err, res) => {
            console.log(err, res)
            pool.end()
        })
    }

    static async updateGamesTable(modifiedData, isFavTable = false) {
        const tableName = isFavTable ? this.favGamesTableName : this.gameTableName
        if (!modifiedData) {
            return null
        }
        const pool = new pg.Pool(this.poolArgs)
        pool.query(
            `INSERT INTO ${tableName}(nsuid, url, image_url, title, normalized_title, fs_id, price_has_discount, age_rating_value)
            VALUES(${modifiedData.nsuid}, 
                ${modifiedData.url}, 
                ${modifiedData.image_url}, 
                ${modifiedData.title}, 
                ${modifiedData.normalizedTitle}, 
                ${modifiedData.fs_id}, 
                ${modifiedData.price_has_discount}, 
                ${modifiedData.age_rating_value})
            ON CONFLICT(nsuid)
	        DO 
	        UPDATE 
	        SET url = ${modifiedData.url},
            image_url = ${modifiedData.image_url},
            title = ${modifiedData.title},
            normalized_title = ${modifiedData.normalizedTitle},
            fs_id = ${modifiedData.fs_id},
            price_has_discount = ${modifiedData.price_has_discount},
            age_rating_value = ${modifiedData.age_rating_value};`,
            (err) => {
                if (err !== undefined) {
                    console.log(modifiedData)
                    console.log(err)
                }
            })
        await pool.end()
    }

    static async getGameDataFromBdByColumn({ table, column, value }) {
        const pool = new pg.Pool(this.poolArgs)
        let response;
        pool.query(
            `SELECT * FROM ${table} WHERE ${column} = ${value};`,
            (err, res) => {
                if (err !== undefined) {
                    console.log(err)
                } else if (!res["rows"].length) {
                    // response = undefined (by default)
                } else {
                    response = JSON.parse(JSON.stringify(res["rows"][0]))
                }
            })
        await pool.end()
        return response;
    }

    static async updateGamePriceTable(modifiedData) {
        const tableName = this.favGamesPricesTableName
        if (!modifiedData) {
            return null
        }
        const pool = new pg.Pool(this.poolArgs)
        pool.query(
            `INSERT INTO ${tableName}
                (id_and_region,
                id,
                price_in_usd,
                discount_price,
                is_discount,
                regular_price,
                local_curency,
                sale_percent,
                discount_end_timestamp,
                discount_end_date,
                region,
                county_emoji)
            VALUES(
                ${modifiedData.id_and_region}, 
                ${modifiedData.id}, 
                ${modifiedData.price_in_usd}, 
                ${modifiedData.discount_price}, 
                ${modifiedData.is_discount}, 
                ${modifiedData.regular_price}, 
                ${modifiedData.local_curency}, 
                ${modifiedData.sale_percent}, 
                ${modifiedData.discount_end_timestamp},
                ${modifiedData.discount_end_date},
                ${modifiedData.region},
                ${modifiedData.county_emoji})
            ON CONFLICT(id_and_region)
	        DO 
	        UPDATE 
	        SET 
            id_and_region = ${modifiedData.id_and_region},
            id = ${modifiedData.id},
            price_in_usd = ${modifiedData.price_in_usd},
            discount_price = ${modifiedData.discount_price},
            is_discount = ${modifiedData.is_discount},
            regular_price = ${modifiedData.regular_price},
            local_curency = ${modifiedData.local_curency},
            sale_percent = ${modifiedData.sale_percent},
            discount_end_timestamp = ${modifiedData.discount_end_timestamp},
            discount_end_date = ${modifiedData.discount_end_date},
            region = ${modifiedData.region},
            county_emoji = ${modifiedData.county_emoji};`,
            (err) => {
                if (err !== undefined) {
                    console.log(modifiedData)
                    console.log(err)
                }
            })
        await pool.end()
    }

    static clearPricesWithEndedDeals() {
        const pool = new pg.Pool(this.poolArgs)
        pool.query(
            `DELETE FROM ${this.favGamesPricesTableName}
            WHERE discount_end_timestamp < ${new Date().getTime()};`, (err, res) => {
            console.log(err, res)
            pool.end()
        })
    }

    static client = new pg.Client(this.poolArgs)
}