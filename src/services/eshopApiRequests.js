import * as nintendo from 'nintendo-switch-eshop';
import DataBaseApi from '../api/db.js';
import * as fs from 'fs';
import ModifyData from '../api/modifyDataFromNintendoApi.js';

export default class Api {
    static async getGamesOfEuropeRegion() {
        await Api.fetchGameListFromApi();
        const data = JSON.parse(fs.readFileSync('./src/models/euGamesList.json'))
        for await (const gameItem of data) {
            const modifiedGameItem = ModifyData.modifyData(gameItem)
            await DataBaseApi.updateGamesTable(modifiedGameItem)
        }
    }

    static async fetchGameListFromApi() {
        fs.writeFileSync('./src/models/euGamesList.json', JSON.stringify(await nintendo.getGamesEurope()), err => {
            if (err) {
                console.error(err);
            } else {
                console.log('Data of europe region games recieved')
            }
        });
    }

    static async getGameObjByUrl(url) {
        const regex = /\/Games.*/g
        const validatedUrl = url.match(regex);
        if (!validatedUrl) {
            return undefined
        }
        const parsedUrl = JSON.stringify(validatedUrl[0]).replaceAll('"', '\'')
        const data = await DataBaseApi.getGameDataFromBdByColumn({
            table: "games",
            column: "url",
            value: parsedUrl
        })
        return data
    }

    static async getGameObjByTitle(title) {
        const modifiedTitle = JSON.stringify(title).replaceAll('"', '\'')
        return DataBaseApi.getGameDataFromBdByColumn({
            table: DataBaseApi.gameTableName,
            column: "normalized_title",
            value: modifiedTitle
        })
    }

    static async getGamePrice({ country = 'PL', gameId = '70010000034009' }) {
        const ans = await nintendo.getPrices(country, gameId)
        console.log('Game price is requested')
        return ans.prices[0]
    }
}