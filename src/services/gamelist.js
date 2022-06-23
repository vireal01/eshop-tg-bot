import Api from "./eshopApiRequests.js";

export default class GameList {
    static gamesData = [];

    static async addGameToList(url) {
        const gameData = await Api.getGameObjByUrl(url)
        if (this.gamesData.filter(e => e.fs_id === gameData.fs_id).length > 0) {
            null
        } else {
            this.gamesData.push(gameData);
        }
    }

    static showSavedGameListTitles() {
        const gameTitlesArr = []
        if (this.gamesData.length === 0) {
            return 'Game list is empty'
        }
        this.gamesData.map(game => gameTitlesArr.push(game.title))
        return gameTitlesArr.join('\n')
    }

    static removeFromList(gameTitle) {
        this.gamesData = this.gamesData.filter(e => e !== gameTitle)
    }
}
