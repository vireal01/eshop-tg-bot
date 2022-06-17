import { Telegraf, Markup } from 'telegraf';
import GameList from './services/gamelist.js';
import GameInfo from './services/gameInfo.js';
import dotenv from "dotenv";
dotenv.config({ silent: process.env.NODE_ENV === 'production' });

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start(async (ctx) => {
    ctx.reply('/keyboard - spawn keyboard \n/list - show all added games\n/addGame ${gametitle} tio add gama to the list')
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

// bot.command('keyboard', (ctx) =>
//     ctx.reply('One time keyboard', Markup
//         .keyboard(['/simple', '/inline', '/pyramid'])
//         // .oneTime()
//         // .resize()
//     )
// )

bot.command('keyboard', async (ctx) => {
    return await ctx.reply('Custom buttons keyboard', Markup
        .keyboard([
            ['🇬🇧 Show regions', 'Add region']
        ])
        // .oneTime()
        .resize()
    )
})

bot.hears('🇬🇧 Show regions', async (ctx) => {
    let contriesText = '';
    for (let countryCode of GameInfo.regionList) {
        contriesText += `${GameInfo.getCountyFlagByCode(countryCode)} ${countryCode}\n`
    }
    ctx.reply(contriesText)
})

bot.hears('Add region', async (ctx) => {
    const availableRegions = []
    for (let countryCode of GameInfo.availableRegionsList) {
        availableRegions.push(`/addRegion ${GameInfo.getCountyFlagByCode(countryCode)}`)
    }
    availableRegions.push('◀️')
    return await ctx.reply('Choose a region to add', Markup
        .keyboard([
            availableRegions
        ])
        // .oneTime()
        .resize()
    )
})

bot.hears('◀️', async (ctx) => {
    return await ctx.reply('/keyboard', Markup
        .keyboard([
            ['🇬🇧 Show regions', 'Add region']
        ])
        // .oneTime()
        .resize()
    )
})

bot.hears(/\/addRegion (.+)/, async (ctx) => {
    const countryFlag = ctx.match[1]
    const countryCode = GameInfo.getCountyCodeByFlag(countryFlag)
    GameInfo.updateRegionList(countryCode)
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
