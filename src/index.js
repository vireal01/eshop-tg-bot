import { Telegraf } from 'telegraf';
import GameList from './services/gamelist.js';
import GameInfo from './services/gameInfo.js';
import dotenv from "dotenv";
dotenv.config({ silent: process.env.NODE_ENV === 'production' });

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start(async (ctx) => {
    ctx.reply('/list - show all added games\n/addGame ${gametitle} tio add gama to the list')
})
bot.help((ctx) => ctx.reply('Send me a sticker'))
// bot.on('sticker', (ctx) => ctx.reply('👍'))

bot.hears(/\/addGame (.+)/, (ctx) => {
    GameList.addGameToList(ctx.match[1]);
    ctx.reply(GameList.gameTitles.join('\n'))
})
bot.hears(/\/removeGame (.+)/, (ctx) => {
    GameList.removeFromList(ctx.match[1]);
    ctx.reply(GameList.gameTitles.join('\n'))
})
bot.command('list', async (ctx) => {
    ctx.reply(GameList.gameTitles.join('\n'))
})
bot.hears(/\/find (.+)/, async (ctx) => {
    const url = ctx.match[1]
    const prices = await GameInfo.getPrices(url)
    const stringifiedData = await GameInfo.stringifyPriceData(prices)
    ctx.reply(stringifiedData.join('\n'))
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
