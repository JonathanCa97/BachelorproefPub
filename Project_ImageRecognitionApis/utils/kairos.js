// libraries
const { models } = require('mongoose');
const defaults = require('superagent-defaults');
const { inspect } = require('util');
const { writingResultsToCSV } = require('./utils');
const _ = require('lodash');
const { wait, TYPESCOUNT } = require('./utils');
let kairosRequestsCounter = 1;
let kairosRequestsCounterStart = new Date();

const getResultsKairos = async () => {
  // get keys
  const kairosKey = process.env.KAIROS_KEY;
  const kairosAppId = process.env.KAIROS_APP_ID;

  // Setup superagent defaults
  const agent = defaults();
  agent
    .set('Content-Type', 'application/json')
    .set('app_id', kairosAppId)
    .set('app_key', kairosKey);

  // Iterate collections and add to Kairos
  // First remove all galeries for sure
  console.log('KAIROS:: removing galleries');
  kairosRequestsCounterStart = new Date();
  const galeryIds = (await agent.post(
    'https://api.kairos.com/gallery/list_all'
  )).body.gallery_ids;
  if (galeryIds) {
    for (let id of galeryIds) {
      console.log('KAIROS:: removing gallery', id);
      await agent
        .post('https://api.kairos.com/gallery/remove')
        .send({ gallery_name: id });
      console.log('KAIROS:: done removing gallery', id);
      doneRequest();
    }
  }

  // Add images to kairos
  console.log('KAIROS:: adding Images1 to gallery IMAGES1');
  const kairosResultsImages1 = await sendToKairosGallery(
    models['Type1'],
    'IMAGES1',
    agent
  );

  console.log(
    'KAIROS:: kairosResultsImages1',
    inspect(kairosResultsImages1, false, null)
  );

  const jsonResults = {};
  console.log('KAIROS:: start iterating over each image');
  for (imageIndex in kairosResultsImages1) {
    if (kairosResultsImages1.hasOwnProperty(imageIndex)) {
      //    if (imageIndex >= 0 && imageIndex <= 41) {
      const imageToFind = kairosResultsImages1[imageIndex];
      console.log('KAIROS:: we have to find image ', imageToFind);
      for (let i = 2; i <= TYPESCOUNT; i++) {
        //  if (i === 1) {
        console.log('KAIROS:: recognizeing from type ', i);
        let detectedUrl1 = 1,
          detectedUrl2 = 1;
        let startTime, endTime;
        let result;
        const imageToCompare = await models['Type' + i]
          .findOne({ imageId: imageIndex })
          .exec();
        console.log('KAIROS:: imageToCompare is ', imageToCompare);
        if (imageToFind.errors) {
          detectedUrl1 = 0;
          console.log('KAIROS:: WARNING: couldnt detect face in image1');
          // Check if we could detect image in other image
          if (imageToCompare) {
            const detectResult = (await agent
              .post('https://api.kairos.com/detect')
              .send({
                image: imageToCompare.url,
              })).body;
            if (detectResult.Errors) {
              detectedUrl2 = 0;
              console.log(
                'KAIROS:: WARNING: couldnt detect face in imageToCompare'
              );
            }
            doneRequest();
          } else {
            console.log('KAIROS:: no image to compare');
          }
        } else {
          if (imageToCompare) {
            try {
              console.log('KAIROS:: start recognizing');
              startTime = new Date().getTime();
              result = (await agent
                .post('https://api.kairos.com/recognize')
                .send({
                  image: imageToCompare.url,
                  gallery_name: 'IMAGES1',
                  max_num_results: 1,
                })).body;
              endTime = new Date().getTime();
              console.log(
                'KAIROS:: done recognizing, result: ',
                inspect(result, false, null)
              );
              if (result.Errors) {
                detectedUrl2 = 0;
                console.log(
                  'KAIROS:: WARNING: couldnt detect face in imageToCompare when recognizing '
                );
              } else {
                result = result.images && result.images[0];
              }
              doneRequest();
              console.log(`KAIROS:: destructured result`, result);
            } catch (e) {
              console.log(
                'KAIROS:: EXCEPTION: ',
                e.respone ? e.respone.text : e
              );
              detectedUrl2 = 0;
            }
          } else {
            detectedUrl2 = 0;
          }
        }
        let recognized = 0;
        if (result && result.candidates) {
          recognized =
            Number(result.candidates[0].subject_id) ===
            Number(imageToFind.subject_id)
              ? 1
              : 0;
          console.log('KAIROS:: recognized: ', recognized);
        }
        const jsonResult = {
          id: imageIndex,
          url1: imageToFind.url,
          url2: imageToCompare && imageToCompare.url,
          confidence:
            result && result.transaction && result.transaction.confidence,
          recognized,
          responseTime: endTime - startTime,
          detectedUrl1,
          detectedUrl2,
        };
        _.update(
          jsonResults,
          i,
          arr => (arr ? arr.concat(jsonResult) : [jsonResult])
        );
        // }
      }
      //  }
    }
  }

  // Write results to cv from eacht type (f.e KAIROS_NORMAL_RESULTS.csv)
  console.log('KAIROS:: start writing to cvs...');
  for (jsonTypeResult in jsonResults) {
    await writingResultsToCSV(
      jsonResults[jsonTypeResult],
      'KAIROS',
      jsonTypeResult
    );
  }
};

// HELP METHODS
const sendToKairosGallery = async (model, galleryName, agent) => {
  const kairosResults = {};
  const images = await model.find({}).exec();
  for (let image of images) {
    const gallery_name = `${galleryName}`;
    console.log('KAIROS:: pushing image to gallery ' + gallery_name, image);
    for (url of image.urls) {
      if (url) {
        const subject_id = `${image.imageId}`;
        try {
          const res = await agent.post('https://api.kairos.com/enroll').send({
            image: url,
            subject_id,
            gallery_name,
          });
          doneRequest();
          console.log(
            `KAIROS:: result from subject_id ${subject_id} (url: ${url})`,
            inspect(res.body, false, null)
          );
          kairosResults[image.imageId] = {
            url,
            subject_id,
            gallery_name,
            errors: res.body.Errors,
          };
        } catch (e) {
          console.log('KAIROS:: EXCEPTION: -enroll-', e);
        }
      } else {
        console.log(
          'KAIROS:: WARNING: no url for this image, not pushing to galery'
        );
      }
    }
  }
  return kairosResults;
};
// Wait eventually few seconds because you can send max 25 requests per minute to Kairos
const doneRequest = () => {
  wait(1000);
  if (
    kairosRequestsCounter >= 24 &&
    new Date() - kairosRequestsCounterStart <= 60000
  ) {
    console.log('KAIROS:: done max requests, waiting...');
    wait(60000);
    console.log('KAIROS:: done waiting');
    kairosRequestsCounter = 0;
    kairosRequestsCounterStart = new Date();
  } else {
    kairosRequestsCounter++;
  }
};

module.exports = {
  getResultsKairos,
};
