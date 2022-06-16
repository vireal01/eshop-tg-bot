import * as nintendo from 'nintendo-switch-eshop';
import * as fs from 'fs';
// import data from '../models/euGamesList.json' assert {type: "json"}

export default class Api {
    static dataFilePath = './src/models/euGamesList.json'

    static async getGamesOfEuropeRegion() {
        const ans = await nintendo.getGamesEurope()
        fs.writeFile(this.dataFilePath, JSON.stringify(ans), err => {
            if (err) {
                console.error(err);
            } else {
                console.log('Data of europe region games recieved')
            }
        });
    }

    static async checkDataFileExists() {
        if (!fs.existsSync(this.dataFilePath) || fs.read(this.dataFilePath).length === 0) {
            await Api.getGamesOfEuropeRegion();
        }
        return JSON.stringify(fs.readFileSync(this.dataFilePath))
    }

    static async getGameObjByUrl(url) {
        const regex = /\/Games.*/g
        const parsedUrl = url.match(regex)[0]
        let gameData;
        const data = await this.checkDataFileExists();
        data.forEach(element => {
            if (element.url === parsedUrl) {
                return gameData = element
            }
        })
        return gameData
    }

    static async getGamePrice({ country = 'PL', gameId = '70010000034009' }) {
        const ans = await nintendo.getPrices(country, gameId)
        // console.log(JSON.stringify(ans.prices[0])) 
        return ans.prices[0]
    }
}
// Api.getGamePrice({})
// Api.getGamesOfEuropeRegion()
// console.log(data[0].fs_id)
// console.log(Api.getGameObjByUrl('https://www.nintendo.co.uk/Games/Nintendo-Switch-download-software/Moonlighter-1423773.html'))
// module.exports = Api; 
