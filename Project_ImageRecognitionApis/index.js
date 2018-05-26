// libraries
const { addImagesToCloudinaryAndSaveFilesToMongo } = require('./utils/cloud');
const { getResultsKairos } = require('./utils/kairos');
const { getResultsMicrosoft } = require('./utils/microsoft');
const { getResultsFacePlusPlus } = require('./utils/faceplusplus');
const { getResultsSkyBiometry } = require('./utils/skyBiometry');
const mongoose = require('mongoose');

// enable .env files for windows
require('dotenv').config();

const setup = async () => {
  console.log('connecting...');
  mongoose.connect('mongodb://localhost:27017/imageRecognitionApis');

  const db = mongoose.connection;
  await db.once('open', async () => {
    //await addImagesToCloudinaryAndSaveFilesToMongo();
    // Execute tasks parallel
    // await Promise.all([
    // await getResultsKairos();
    // await getResultsMicrosoft();
    // await getResultsFacePlusPlus();
    await getResultsSkyBiometry();
    // ]);
  });
};

setup();
