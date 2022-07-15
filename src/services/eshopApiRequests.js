import * as nintendo from 'nintendo-switch-eshop';
import * as fs from 'fs';
import DataBaseApi from '../api/db.js';
import ModifyData from '../api/modifyDataFromNintendoApi.js';
// import data from '../models/euGamesList.json' assert {type: "json"}

export default class Api {
    static dataFilePath = './src/models/euGamesList.json'
    static dataJapanFilePath = './src/models/jpGamesList.json'

    static async getGamesOfEuropeRegion() {
        const ans = await nintendo.getGamesEurope()
        await DataBaseApi.createGameTableIfNotCreated()
        for await (const gameItem of ans) {
            const modifiedGameItem = ModifyData.modifyData(gameItem)
            await DataBaseApi.updateGamesTable(modifiedGameItem)
        }

        fs.writeFile(this.dataFilePath, JSON.stringify(ans), err => {
            if (err) {
                console.error(err);
            } else {
                console.log('Data of europe region games recieved')
            }
        });
    }

    static async getGamesOfJapanRegion() {
        const ans = await nintendo.getGamesJapan()
        fs.writeFile(this.dataJapanFilePath, JSON.stringify(ans), err => {
            if (err) {
                console.error(err);
            } else {
                console.log('Data of japan region games recieved')
            }
        });
    }

    static async checkDataFileExists() {
        if (!fs.existsSync(this.dataFilePath) || fs.readFileSync(this.dataFilePath).length === 0) {
            console.log('European region data file is not created. Fetching the games data file')
            await Api.getGamesOfEuropeRegion();
        }
        // if (!fs.existsSync(this.dataJapanFilePath) || fs.readFileSync(this.dataJapanFilePath).length === 0) {
        //     console.log('Japan region data file is not created. Fetching the games data file')
        //     await Api.getGamesOfJapanRegion()
        // }
        const response = await JSON.parse(fs.readFileSync(this.dataFilePath))
        return response
    }

    static async getGameObjByUrl(url) {
        const regex = /\/Games.*/g
        const parsedUrl = url.match(regex)
        if (!parsedUrl) {
            return parsedUrl
        }
        let gameData;
        const data = await this.checkDataFileExists();
        data.forEach(element => {
            if (element.url === parsedUrl[0]) {
                return gameData = element
            }
        })
        return gameData
    }

    static async getGamePrice({ country = 'PL', gameId = '70010000034009' }) {
        const ans = await nintendo.getPrices(country, gameId)
        console.log('Game price is requested')
        return ans.prices[0]
    }
}

Api.getGamesOfEuropeRegion();