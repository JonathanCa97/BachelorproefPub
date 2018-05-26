// libraries
const { models } = require('./mongoose');
const defaults = require('superagent-defaults');
const { inspect } = require('util');
const { writingResultsToCSV } = require('./utils');
const _ = require('lodash');
const { wait, TYPESCOUNT } = require('./utils');
let microsoftRequestsCounter = 1;
let microsoftRequestsCounterStart;
const FAILED = 'FAILED';

const getResultsMicrosoft = async () => {
  // Microsoft API
  const microsoftKey = process.env.MICROSOFT_KEY;

  // Setup superagent defaults
  const agent = defaults();
  agent
    .set('Ocp-Apim-Subscription-Key', microsoftKey)
    .set('Content-Type', 'application/json');
  microsoftRequestsCounterStart = new Date();

  // Remove personGroup
  console.log('MICROSOFT:: remove personGroup');
  microsoftRequestsCounterStart = new Date();
  try {
    await agent.del(
      'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/1'
    );
  } catch (e) {}
  doneRequest();

  console.log('MICROSOFT:: create personGroup');
  await agent
    .put(
      'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/1'
    )
    .send({ name: 'IMAGES1' });
  doneRequest();

  // Detect first images and add to list
  console.log('MICROSOFT:: get detecting results IMAGES1');
  const images1 = await models['Type1'].find({}).exec();
  const images1PersonIds = {};
  const faceIds = [];
  const images1Results = {};
  for (image of images1) {
    console.log('MICROSOFT:: create PersonGroup Person ', image);
    const personId = (await agent
      .post(
        'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/1/persons'
      )
      .send({ name: image.imageId })).body.personId;
    images1PersonIds[image.imageId] = personId;
    doneRequest();
    console.log('MICROSOFT:: add faces to person personGroup');
    for (url of image.urls) {
      try {
        await agent
          .post(
            'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/1/persons/' +
              personId +
              '/persistedFaces'
          )
          .send({ url });
        doneRequest();
      } catch (e) {
        console.log('MICROSOFT:: EXCEPTION: ', e.response.text);
        doneRequest();
      }
    }
    console.log('MICROSOFT:: going to detect ', image);
    const faceId = await detectImageByImageUrl(image.urls[0], agent);
    images1Results[image.imageId] = {
      url: image.urls[0],
      faceId,
    };
    if (faceId) {
      faceIds.push(faceId);
    }
  }

  console.log('MICROSOFT:: done training');
  console.log(
    'MICROSOFT:: images1PersonIds ',
    inspect(images1PersonIds, false, null)
  );
  console.log('MICROSOFT:: faceIds', faceIds);
  console.log(
    'MICROSOFT:: images1Results',
    inspect(images1Results, false, null)
  );

  console.log('MICROSOFT:: going to train the personGroup');
  await agent.post(
    'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/1/train'
  );
  doneRequest();

  // Recognize images
  console.log('MICROSOFT:: start recognizing images');
  const jsonResults = {};
  const jsonTrainResults = {};
  for (imageId in images1Results) {
    // if (imageId <= 5) {
    if (images1Results.hasOwnProperty(imageId)) {
      const imageToFind = images1Results[imageId];
      console.log('MICROSOFT:: we have to find image ', imageToFind);
      for (let i = 2; i <= TYPESCOUNT; i++) {
        //   if (i >= 7) {
        const imageToCompare = await models['Type' + i]
          .findOne({ imageId })
          .exec();
        console.log(
          'MICROSOFT:: we have to compare image ' +
            imageToCompare +
            ' from type ' +
            i
        );
        let startTime = 0,
          endTime = 0,
          detectTime = 0,
          result;

        // Check if we can detect the imageToCompare
        let imageToCompareFaceId;
        if (imageToCompare) {
          console.log('MICROSOFT:: try detecting imageToCompare');
          startTime = new Date().getTime();
          imageToCompareFaceId = await detectImageByImageUrl(
            imageToCompare.url,
            agent
          );
          detectTime = new Date().getTime() - startTime;
        }

        // Find similar
        if (imageToFind.faceId && imageToCompareFaceId !== null) {
          startTime = new Date().getTime();
          try {
            console.log('MICROSOFT:: start trying to find similars');
            result = (await agent
              .post(
                'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/findsimilars'
              )
              .send({
                faceId: imageToCompareFaceId,
                faceIds,
                maxNumOfCandidatesReturned: 1,
              })).body;
            endTime = new Date().getTime();
            console.log(
              'MICROSOFT:: done request, findsimilars result',
              inspect(result, false, null)
            );
            doneRequest();
          } catch (e) {
            console.log(
              'MICROSOFT:: EXEPTION -findsimilars-: ',
              e.response.text
            );
            doneRequest();
          }
        } else {
          console.log('MICROSOFT:: 1 of 2 images not detected');
        }

        const jsonResult = {
          id: imageId,
          url1: imageToFind.url,
          url2: imageToCompare && imageToCompare.url,
          confidence: result && result[0] && result[0].confidence,
          recognized:
            result && result[0] && result[0].faceId === imageToFind.faceId
              ? 1
              : 0,
          responseTime: endTime - startTime + detectTime,
          detectedUrl1: imageToFind.faceId ? 1 : 0,
          detectedUrl2: imageToCompareFaceId ? 1 : 0,
        };
        _.update(
          jsonResults,
          i,
          arr => (arr ? arr.concat(jsonResult) : [jsonResult])
        );

        // Identify
        if (imageToFind.faceId) {
          startTime = new Date().getTime();
          try {
            console.log('MICROSOFT:: start trying to identify');
            result = (await agent
              .post(
                'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/identify'
              )
              .send({
                faceIds: [imageToCompareFaceId],
                personGroupId: 1,
                maxNumOfCandidatesReturned: 1,
              })).body;
            endTime = new Date().getTime();
            console.log(
              'MICROSOFT:: done request, identify result',
              inspect(result, false, null)
            );
            doneRequest();
          } catch (e) {
            console.log(
              'MICROSOFT:: EXEPTION -identify-: ',
              e.response && e.response.text
            );
            doneRequest();
          }
        }
        const candidate =
          result &&
          result[0] &&
          result[0] &&
          result[0].candidates &&
          result[0].candidates[0];
        const jsonTrainResult = {
          id: imageId,
          url1: imageToFind.url,
          url2: imageToCompare && imageToCompare.url,
          confidence: candidate && candidate.confidence,
          recognized:
            candidate && candidate.personId === images1PersonIds[imageId]
              ? 1
              : 0,
          responseTime: endTime - startTime + detectTime,
          detectedUrl1: imageToFind.faceId ? 1 : 0,
          detectedUrl2: imageToCompareFaceId ? 1 : 0,
        };
        _.update(
          jsonTrainResults,
          i,
          arr => (arr ? arr.concat(jsonTrainResult) : [jsonTrainResult])
        );
        // }
      }
    }
    // }
  }
  // Write results to cv from each type (f.e MICROSOFT_NORMAL_RESULTS.csv)
  console.log('MICROSOFT:: start writing to csv...');
  for (jsonTypeResult in jsonResults) {
    await writingResultsToCSV(
      jsonResults[jsonTypeResult],
      'MICROSOFT',
      jsonTypeResult
    );
  }

  console.log('MICROSOFT:: start writing training results to csv...');
  for (jsonTypeResult in jsonTrainResults) {
    await writingResultsToCSV(
      jsonTrainResults[jsonTypeResult],
      'MICROSOFTTRAINED',
      jsonTypeResult
    );
  }
};

// HELP METHODS
const detectImages1 = async (images, agent) => {};

const addImagesToList = async (images, agent, faceListId) => {
  const imagesResult = {};
  console.log('MICROSOFT:: adding images to list with id ', faceListId);
  for (let image of images) {
    if (image.imageId <= 5) {
      try {
        const res = await agent
          .post(
            'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/facelists/' +
              faceListId +
              '/persistedFaces'
          )
          .send({ url: image.urls[0] });
        console.log('MICROSOFT:: successfully detected image ', res.body);
        imagesResult[image.imageId] = { ...res.body, url: image.url };
      } catch (e) {
        console.log(
          'MICROSOFT:: WARNING: could not add image ',
          e.response.body.error.code
        );
        imagesResult[image.imageId] = { error: FAILED, url: image.url };
      }
      doneRequest();
    }
  }
  return imagesResult;
};

const detectImageByImageUrl = async (url, agent) => {
  // Only detect with first url
  try {
    const body = (await agent
      .post(
        'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true'
      )
      .send({ url })).body;
    console.log('MICROSOFT:: done detecting ', inspect(body, false, null));
    doneRequest();
    if (body.length <= 0) {
      console.log('MICROSOFT:: WARNING: could not detect face ');
    }
    return body[0] ? body[0].faceId : undefined;
  } catch (e) {
    console.log('MICROSOFT:: EXCEPTION: ', e.response.text);
    doneRequest();
  }
  return undefined;
};

// Wait eventually few seconds because you can send max 20 requests per minute to Microsoft
const doneRequest = () => {
  console.log(microsoftRequestsCounter);
  wait(1000);
  if (
    microsoftRequestsCounter >= 19 &&
    new Date() - microsoftRequestsCounterStart <= 60000
  ) {
    console.log('MICROSOFT:: done max requests, waiting...');
    wait(60000);
    console.log('MICROSOFT:: done waiting');
    microsoftRequestsCounter = 0;
    microsoftRequestsCounterStart = new Date();
  } else {
    microsoftRequestsCounter++;
  }
};

module.exports = {
  getResultsMicrosoft,
};
