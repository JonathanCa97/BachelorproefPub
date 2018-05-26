const defaults = require('superagent-defaults');
const { wait, TYPESCOUNT, writingResultsToCSV } = require('./utils');
const { models } = require('./mongoose');
const _ = require('lodash');
const FAILED = 'FAILED';
const { inspect } = require('util');
const mongoose = require('mongoose');

const facePPTokens = mongoose.Schema({
  faceToken: String,
  imageId: Number,
});
const facePPTokensModel = mongoose.model('facePPTokens', facePPTokens);

const getResultsFacePlusPlus = async () => {
  // Get keys
  const api_key = process.env.FACEPLUSPLUS_API_KEY;
  const api_secret = process.env.FACEPLUSPLUS_API_SECRET;

  // Setup superagent defaults
  const agent = defaults();
  agent.set('Content-Type', 'application/json');

  // Get all faceSets and delete them
  console.log('FACEPP:: removing faceSets');
  const faceSets = (await agent
    .post('https://api-us.faceplusplus.com/facepp/v3/faceset/getfacesets')
    .query({ api_key, api_secret })).body.facesets;
  // Fot this FREE API, we have to wait 1 sec after each request
  wait(1000);
  for (faceSet of faceSets) {
    console.log('FACEPP:: deleting faceSet ' + faceSet.outer_id);
    await agent
      .post('https://api-us.faceplusplus.com/facepp/v3/faceset/delete')
      .query({
        api_key,
        api_secret,
        outer_id: faceSet.outer_id,
        check_empty: 0,
      });
    wait(1000);
  }

  const faceSetOuterId = 0;
  const detectResultsImages1 = {};

  console.log('FACEPP:: adding faceset with id ' + faceSetOuterId);
  await agent
    .post('https://api-us.faceplusplus.com/facepp/v3/faceset/create')
    .query({ api_key, api_secret, outer_id: faceSetOuterId });
  console.log('FACEPP:: done adding faceset with id ' + faceSetOuterId);
  wait(1000);

  // console.log('FACEPP:: adding Images1 faces to faceSet');
  const firstImages = await await models['Type1'].find({}).exec();
  for (imageToAdd of firstImages) {
    // First detect faceStart recognize
    console.log('FACEPP:: try detecting face ' + imageToAdd);
    try {
      const detectedFaceResult = (await agent
        .post('https://api-us.faceplusplus.com/facepp/v3/detect')
        .query({ api_key, api_secret, image_url: imageToAdd.urls[0] })).body
        .faces[0];
      console.log(
        'FACEPP:: done try detecting face, result: ' +
          inspect(detectedFaceResult, false, null)
      );
      wait(1000);
      const detectedFace = {
        error: !detectedFaceResult && FAILED,
        imageId: imageToAdd.imageId,
        url: imageToAdd.url,
        face_token: detectedFaceResult && detectedFaceResult.face_token,
        outer_id: faceSetOuterId,
      };

      detectResultsImages1[imageToAdd.imageId] = detectedFace;

      // Add face to faceSet
      if (detectedFaceResult.face_token) {
        // ----- this is needed for last experiment (Project_realTime)
        await facePPTokensModel.update(
          { faceToken: detectedFaceResult.face_token },
          { imageId: imageToAdd.imageId },
          { upsert: true }
        );
        // ------
        console.log(
          'FACEPP:: adding images1 face with id ' +
            imageToAdd.imageId +
            ' to faceSet'
        );
        await agent
          .post('https://api-us.faceplusplus.com/facepp/v3/faceset/addface')
          .query({
            api_key,
            api_secret,
            outer_id: faceSetOuterId,
            face_tokens: detectedFaceResult.face_token,
          });
        console.log(
          'FACEPP:: done adding images1 face with id ',
          imageToAdd.imageId
        );
        wait(1000);
      } else {
        console.log('FACEPP:: WARNING: face not detected');
      }
    } catch (e) {
      console.log('FACEPP:: EXCEPTION: ', e.response.text);
    }
  }

  console.log(
    'FACEPPP:: detect results images 1',
    inspect(detectResultsImages1, false, null)
  );

  // Start recognizing images
  console.log('FACEPPP:: Start recognizing images');
  const jsonResults = {};
  for (image of firstImages) {
    for (let typeCounter = 2; typeCounter <= TYPESCOUNT; typeCounter++) {
      // if (typeCounter >= 2) {
      const type = 'Type' + typeCounter;
      const imageToCompare = await models[type]
        .findOne({ imageId: image.imageId })
        .exec();
      console.log('FACEPPP:: imageToCompare is ', imageToCompare);
      if (imageToCompare) {
        let detectedUrl1, detectedUrl2, detectedFaceResult;
        console.log('FACEPP:: try deecting imageToCompare ');
        try {
          detectedFaceResult = (await agent
            .post('https://api-us.faceplusplus.com/facepp/v3/detect')
            .query({ api_key, api_secret, image_url: imageToCompare.url })).body
            .faces[0];
          console.log(
            'FACEPP:: done detecting image, result ',
            inspect(detectedFaceResult, false, null)
          );
        } catch (e) {
          console.log('FACEPP:: EXCEPTION:: ', e);
        }
        wait(1000);
        detectedUrl1 = !detectResultsImages1[image.imageId].error ? 1 : 0;
        detectedUrl2 = detectedFaceResult ? 1 : 0;
        let startTime = 0,
          endTime = 0,
          recognizeResult;
        // If both images are detected, we can search
        if (detectedUrl1 === 1 && detectedUrl2 === 1) {
          startTime = new Date().getTime();
          console.log('FACEPP:: start recognizing');
          try {
            recognizeResult = (await agent
              .post('https://api-us.faceplusplus.com/facepp/v3/search')
              .query({
                api_key,
                api_secret,
                image_url: imageToCompare.url,
                outer_id: 0,
              })).body.results[0];
            console.log(
              'FACEPP:: done recognizing, result ',
              inspect(recognizeResult, false, null)
            );
            endTime = new Date().getTime();
            wait(1000);
          } catch (e) {
            endTime = new Date().getTime();
            console.log('FACEPP:: EXCEPTION:', e);
          }
        } else {
          console.log('FACEPP:: couldnt detect 1 of the 2 images');
        }
        const jsonResult = {
          id: image.imageId,
          url1: image.urls[0],
          url2: imageToCompare.url,
          confidence: recognizeResult && recognizeResult.confidence,
          recognized:
            recognizeResult &&
            detectResultsImages1[image.imageId].face_token ===
              recognizeResult.face_token
              ? 1
              : 0,
          responseTime: endTime - startTime,
          detectedUrl1,
          detectedUrl2,
        };
        _.update(
          jsonResults,
          typeCounter,
          arr => (arr ? arr.concat(jsonResult) : [jsonResult])
        );
      }
      //  }
    }
  }

  // Write results to cv from each type (f.e FACEPP_NORMAL_RESULTS.csv)
  console.log('FACEPP:: start writing to csv...');
  for (jsonTypeResult in jsonResults) {
    await writingResultsToCSV(
      jsonResults[jsonTypeResult],
      'FACEPP',
      jsonTypeResult
    );
  }
};

module.exports = {
  getResultsFacePlusPlus,
};
