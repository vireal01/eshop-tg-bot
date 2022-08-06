import cron from 'node-cron';
import DataBaseApi from '../api/db.js';
import Api from '../services/eshopApiRequests.js';

cron.schedule('*/30 * * * *', async function () {
  // commented coz haven't solve problem with cpu usage
  // await Api.getGamesOfEuropeRegion()
  DataBaseApi.clearPricesWithEndedDeals()
  console.log('Game list updated')
});
