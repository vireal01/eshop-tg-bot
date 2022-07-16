import cron from 'node-cron';
import Api from '../services/eshopApiRequests.js';

cron.schedule('* */6 * * * ', async function () {
  await Api.getGamesOfEuropeRegion()
  console.log('Game list updated')
});
