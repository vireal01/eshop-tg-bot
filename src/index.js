import { Telegraf, Markup } from 'telegraf';
import GameList from './services/gamelist.js';
import GameInfo from './services/gameInfo.js';
import dotenv from "dotenv";
import Helpers from './helpers/helperFunctions.js';
dotenv.config({ silent: process.env.NODE_ENV === 'production' });

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start(async (ctx) => {
    ctx.reply('/help')
})

bot.hears(/\/help/, (ctx) => {
    ctx.reply('/keyboard - spawn keyboard\n/addGame ${gametitle} to add a game to the list\n/list - show list of saved games')
})

bot.hears(/\/addGame (.+)/, async (ctx) => {
    const url = ctx.match[1]
    if (Helpers.linkValidator(url)) {
        await GameList.addGameToList(url)
        ctx.reply('Game added to favorites')
    } else {
        ctx.reply('Please enter a valid game url')
    }
})

bot.hears(/\/list/, (ctx) => {
    ctx.reply(GameList.showSavedGameListTitles())
})


bot.hears(/\/removeGame (.+)/, (ctx) => {
    GameList.removeFromList(ctx.match[1]);
    ctx.reply(GameList.gamesData.join('\n'))
})

bot.hears(/\/find (.+)/, async (ctx) => {
    const url = ctx.match[1]
    if (Helpers.linkValidator(url)) {
        const message = await GameInfo.getGameInfoMessage(url)
        ctx.reply(message)
    } else {
        ctx.reply('Please enter a valid game url')
    }
})

bot.hears(/\/t (.+)/, async (ctx) => {
    const title = ctx.match[1]
    const normalizedTitle = Helpers.normalizeTitle(title)
    if (!Helpers.titleValidator(normalizedTitle)) {
        const message = await GameInfo.getGameInfoMessageByTitle(normalizedTitle)
        ctx.reply(message)
    } else {
        ctx.reply('Please enter a valid game url')
    }
})

bot.command('keyboard', async (ctx) => {
    await ctx.reply('Custom buttons keyboard', Markup
        .keyboard([
            ['🇬🇧 Show regions', 'Add region']
        ])
        .resize()
    )
    await ctx.deleteMessage()
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
    await ctx.reply('Choose a region to add', Markup
        .keyboard([
            availableRegions
        ])
    )
    await ctx.deleteMessage()
})

bot.hears('◀️', async (ctx) => {
    await ctx.reply('/keyboard', Markup
        .keyboard([
            ['🇬🇧 Show regions', 'Add region']
        ])
        .resize()
    )
    await ctx.deleteMessage()
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
