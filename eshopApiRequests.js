const nintendo = require('nintendo-switch-eshop');
const fs = require('fs');
const data = require('./gamesList.json')

class Api {
    static async getA() {
        const ans = await nintendo.getGamesEurope()
        fs.writeFile('gamesList.json', JSON.stringify(ans), err => {
            if (err) {
                console.error(err);
            }
        });
    }

    static getGameObjByUrl(url) {
        const regex = /\/Games.*/g
        const parsedUrl = url.match(regex)[0]
        let gameData
        data.forEach(element => {
            if(element.url === parsedUrl){
                return gameData = element
            }
        });
        return gameData
    }

    static async getGamePrice({country = 'PL', gameId = '70010000034009'}) {
        const ans = await nintendo.getPrices(country, gameId)
        // console.log(JSON.stringify(ans.prices[0])) 
        return ans.prices[0]
    }
}
// Api.getGamePrice({})
// Api.getA()
// console.log(data[0].fs_id)
// console.log(Api.getGameObjByUrl('https://www.nintendo.co.uk/Games/Nintendo-Switch-download-software/Moonlighter-1423773.html'))
module.exports = Api; 
