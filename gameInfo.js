import Api from "./eshopApiRequests.js";
import countryCodeEmoji from "country-code-emoji";
import CC from 'currency-converter-lt';

export default class GameInfo{
    // static regionList = ['PL', 'ZA', 'JP']
    static regionList = ['PL', 'ZA']

    static async stringifyPriceData(pricesData){
        //{"title_id":70010000011030,"sales_status":"onsale","regular_price":{"amount":"R328.00","currency":"ZAR","raw_value":"328"},"discount_price":{"amount":"R65.60","currency":"ZAR","raw_value":"65.60","start_datetime":"2022-05-24T13:00:00Z","end_datetime":"2022-06-23T21:59:59Z"},"gold_point":{"basic_gift_gp":"33","basic_gift_rate":"0.05","consume_gp":"0","extra_gold_points":[],"gift_gp":"33","gift_rate":"0.05"}}
        const formatedPrices = []
        for await (const priceElementData of pricesData){
            const pasrsedElement = JSON.parse(JSON.stringify(priceElementData))
            const countyEmoji = countryCodeEmoji(pasrsedElement.region)
            const regularPrice = pasrsedElement.regular_price
            const discountPrice = pasrsedElement.discount_price
            const priceToCalculate = discountPrice ? discountPrice?.amount : regularPrice.amount
            const priceInUsd = await this.calculatePriceInUSD(priceToCalculate, regularPrice.currency)
            const saleAmount = discountPrice ? 
                `${(this.calculateSalePercent(regularPrice.amount, discountPrice.amount))}% \n` : ''
            const saleString  = discountPrice ? `\nOn sale price: ${discountPrice.amount} \nOffer ends: ${this.formateDate(discountPrice.start_datetime)}` : ''
            formatedPrices.push(`${countyEmoji} Sale: ${saleAmount}Currency: ${regularPrice.currency}. \nFull-price ${regularPrice.amount} ${saleString} \nUSD: ${priceInUsd}$
            `)
        }
        return formatedPrices
    }

    static getCountyFlagByCode(countryCode){
        return countryCodeEmoji(countryCode)
    }

    static calculateSalePercent(fullPrice, discountPrice){
        return ((1 -this.formatPrice(discountPrice) /  this.formatPrice(fullPrice)) * 100).toFixed(0)  
    }

    static formatPrice(price){
        const priceArr =  price.match(/\d[,.]*/g).join('').replace(',','.').split('.')
        return Number.parseFloat(`${priceArr.slice(0,-1).join('')}.${priceArr.slice(-1)[0]}`)
    }

    static formateDate(dateString){
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC',  hour: '2-digit', minute: '2-digit' 
        };
        return date.toLocaleString('en-US' , options)
    }

    static async calculatePriceInUSD(itemPrice, currency){
        const price = this.formatPrice(itemPrice);
        let currencyConverter = new CC({from:currency, to:"USD", amount:price})
        let priceInUsd
        await currencyConverter.convert().then((response) => {
            priceInUsd =  response.toFixed(1)
        })
        return priceInUsd
    }

    static async getPrices(url){
        const gameData = Api.getGameObjByUrl(url)
        const prices = []
        for await (const region of this.regionList){
            const priceData  = await Api.getGamePrice({country: region, gameId: gameData.nsuid_txt[0]})
            priceData.region = region
            prices.push(priceData)
        }
        return prices
    }
}
// module.exports = GameInfo;
