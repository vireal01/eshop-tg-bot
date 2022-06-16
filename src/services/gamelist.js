export default class GameList {
     static gameTitles = ['Game 1', 'Game 2', 'Game 3'];

    static addGameToList(gameTitle) {
        this.gameTitles.push(gameTitle);
    }

    static removeFromList(gameTitle) {
        this.gameTitles = this.gameTitles.filter(e => e !== gameTitle)
    }
}

// export default GameList;
