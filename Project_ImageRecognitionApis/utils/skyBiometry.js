const defaults = require('superagent-defaults');
const { TYPESCOUNT, writingResultsToCSV } = require('./utils');
const { models } = require('mongoose');
const _ = require('lodash');
const FAILED = 'FAILED';
const { inspect } = require('util');
let skyBiometryCounter = 1;
let skyBiometryCounterStart;

const getResultsSkyBiometry = async () => {
  // Get keys
  const api_key = process.env.SKYBIOMETRY_API_KEY;
  const api_secret = process.env.SKYBIOMETRY_API_SECRET;
  const namespace = 'trainOr';

  // Setup superagent defaults
  const agent = defaults();
  agent.set('Content-Type', 'application/json');

  // Iterate each image in images1 and train them
  const images1 = await models['Type1'].find({}).exec();
  const notDetectedImagesIds = [];
  const uids = [];

  console.log('SKYBIOMETRY:: first detecting Images1');
  for (let image of images1) {
    // First detect images so we can train them
    console.log('SKYBIOMETRY:: try detecting image ', image);
    try {
      const detectResult = (await agent
        .post('http://api.skybiometry.com/fc/faces/detect')
        .query({ urls: image.urls.join(','), api_key, api_secret })).body;
      console.log(
        'SKYBIOMETRY:: detect result ',
        inspect(detectResult, false, null)
      );

      // Save the images with specified tag
      const tids = detectResult.photos.reduce((ptids, photo) => {
        return photo.tags[0] ? ptids.concat(photo.tags[0].tid) : ptids;
      }, []);
      const uid = `${image.imageId}@${namespace}`;
      if (tids.length > 0) {
        console.log('SKYBIOMETRY:: going to save detected image');
        const saveResult = (await agent
          .post('http://api.skybiometry.com/fc/tags/save')
          .query({ api_key, api_secret, uid, tids: tids.join(',') })).body;
        console.log(
          'SKYBIOMETRY:: done saving detected image',
          inspect(saveResult, false, null)
        );
        uids.push(uid);
        // A uud has multiple tids
      } else {
        console.log('SKYBIOMETRY:: WARNING: dit not detect image');
        notDetectedImagesIds.push(image.imageId);
      }
    } catch (e) {
      console.log('SKYBIOMETRY:: exception ' + e);
    }
  }

  console.log('SKYBIOMETRY:: notDetectedISmagesIds ', notDetectedImagesIds);
  console.log('SKYBIOMETRY:: uids ', uids);

  // Train all images
  console.log('SKYBIOMETRY:: train images');
  const res = await agent
    .get('http://api.skybiometry.com/fc/faces/train')
    .query({ api_key, api_secret, uids: uids.join(',') });
  console.log('SKYBIOMETRY:: done training image', res.body);

  // Get all urls per type
  const typeUrls = {};
  console.log('SKYBIOMETRY:: start recognizing images');
  // Start recognizing test
  let jsonResults = {};
  for (let image of images1) {
    // if (image.imageId < 5) {
    for (let i = 2; i <= TYPESCOUNT; i++) {
      //  if (i === 4) {
      const imageToCompare = await models['Type' + i]
        .findOne({ imageId: image.imageId })
        .exec();
      console.log('SKYBIOMETRY:: imageToCompare is  ', imageToCompare);

      // First check if we can detect face in image to compare
      let detectedUrl2 = 0,
        detectResult = 0;
      console.log('SKYBIOMETRY:: detecting imageToCompare');
      if (imageToCompare) {
        try {
          detectResult = (await agent
            .post('http://api.skybiometry.com/fc/faces/detect')
            .query({ urls: imageToCompare.url, api_key, api_secret })).body;
          console.log(
            'SKYBIOMETRY:: done detecting imageToCompare, result',
            inspect(detectResult, false, null)
          );
        } catch (e) {
          console.log('SKYBIOMETRY:: EXCEPTION', e);
        }
      } else {
        console.log('SKYBIOMETRY:: imageToCompare was not in db');
      }
      const detectedUrl1 = notDetectedImagesIds.includes(image.imageId) ? 0 : 1;
      detectedUrl2 =
        detectResult &&
        detectResult.photos[0].tags &&
        detectResult.photos[0].tags.length > 0
          ? 1
          : 0;

      // Start recognizing
      let startTime = 0,
        endTime = 0,
        recognizeResult;
      if (detectedUrl1 === 1 && detectedUrl2 === 1) {
        console.log('SKYBIOMETRY:: start recognizing image');
        try {
          startTime = new Date().getTime();
          recognizeResult = (await agent
            .post('http://api.skybiometry.com/fc/faces/recognize')
            .query({
              api_key,
              api_secret,
              uids: 'all@' + namespace,
              urls: imageToCompare.url,
            })).body;
          endTime = new Date().getTime();
          console.log(
            'SKYBIOMETRY:: recognize result ',
            inspect(recognizeResult, false, null)
          );
        } catch (e) {
          endTime = new Date().getTime();
          console.log('SKYBIOMETRY:: EXCEPTION: ', e);
        }
      } else {
        console.log('SKYBIOMETRY:: 1 of 2 images was not detected');
      }
      const recognizedId =
        recognizeResult &&
        recognizeResult.photos[0] &&
        recognizeResult.photos[0].tags[0] &&
        recognizeResult.photos[0].tags[0].uids[0] &&
        recognizeResult.photos[0].tags[0].uids[0].uid.split('@')[0];

      const jsonResult = {
        id: image.imageId,
        url1: image.urls,
        url2: imageToCompare && imageToCompare.url,
        confidence:
          recognizeResult &&
          recognizeResult.photos[0] &&
          recognizeResult.photos[0].tags[0] &&
          recognizeResult.photos[0].tags[0].uids[0] &&
          recognizeResult.photos[0].tags[0].uids[0].confidence,
        recognized: image.imageId === Number(recognizedId) ? 1 : 0,
        responseTime: endTime - startTime,
        detectedUrl1,
        detectedUrl2,
      };

      _.update(
        jsonResults,
        i,
        arr => (arr ? arr.concat(jsonResult) : [jsonResult])
      );
      //   }
    }
  }

  // Write results to cv from eacht type (f.e SKYBIOMETRY_NORMAL_RESULTS.csv)
  console.log('SKYBIOMETRY:: start writing to cvs...');
  for (jsonTypeResult in jsonResults) {
    await writingResultsToCSV(
      jsonResults[jsonTypeResult],
      'SKYBIOMETRY',
      jsonTypeResult
    );
  }

  // try {
  //   const detectResult = (await agent
  //     .get('http://api.skybiometry.com/fc/faces/status')
  //     .query({ uids: uids.join(','), api_key, api_secret })).body;
  //   console.log(inspect(detectResult, false, null));
  // } catch (e) {
  //   console.log(e);
  // }
};

const doneRequest = () => {
  if (
    skyBiometryCounter >= 100 &&
    new Date() - skyBiometryCounterStart <= 60000 * 60
  ) {
    console.log('SKYBIOMETRY:: done max requests, waiting...');
    // Yes, we have to wait an hour....
    wait(60000 * 60);
    console.log('SKYBIOMETRY:: done waiting');
    skyBiometryCounter = 0;
    skyBiometryCounterStart = new Date();
  } else {
    skyBiometryCounter++;
  }
};

module.exports = {
  getResultsSkyBiometry,
};
