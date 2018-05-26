const EventSource = require('eventsource');
const agent = require('superagent');
const defaults = require('superagent-defaults');
const request = require('request');
const fs = require('fs');
const path = require('path');
const { promisfy } = require('promisfy');
const { inspect } = require('util');
const cloudinary = require('cloudinary');
require('dotenv').config();
const image2base64 = require('image-to-base64');
const mongoose = require('mongoose');
const names = require('./faceNamesById.json');
let firstRequest = true;
let lastMotionDate = '';
const WSS = require('ws').Server;

// The API endpoint from where you want to receive events
const NEST_API_URL = 'https://developer-api.nest.com';

// specifing tokens and ids'
const token =
  'c.7HfMARXZUCIY2HoyrcrHSB5To7hGDTRHWP9atCXxdkb29JFT9e3v3FcdftBzylF4Bdqz4ELzubq0DsUOYjtQJyuhvjqWD4aAsEoh07SDUxC4qzrFEmvdnYN3h3jQMZBApM8y0AlQQHOf2RCl';
const deviceId = 'aRgmxdrdEKV9tu6IjivXMb5pVjU3Lxy0HVgmAl6clDPt1PzKnPfolw';

// Seting up API agent
const kairosKey = process.env.KAIROS_KEY;
const kairosAppId = process.env.KAIROS_APP_ID;
const facePPKey = process.env.FACEPP_KEY;
const facePPSecret = process.env.FACEPP_SECRET;

// Set up cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Other consts
const UNKNOWN_PATH = './img/unknown.jpeg';

// Setting up mongoose
mongoose.connect('mongodb://localhost:27017/imageRecognitionApis');

const db = mongoose.connection;
console.log('connected to mongoose...');

const facePPTokens = mongoose.Schema({
  faceToken: String,
  imageId: Number,
});

const facePPTokensModel = mongoose.model('facePPTokens', facePPTokens);

const apiAgent = defaults();
apiAgent
  .set('Content-Type', 'application/json')
  .set('app_id', kairosAppId)
  .set('app_key', kairosKey);

/**
 * Start REST streaming device events given a Nest token.
 */
const startStreaming = async () => {
  // Setting up eventsource (nest <-> server) and websockets (server <-> web client)
  const headers = {
    Authorization: 'Bearer ' + token,
  };
  const source = new EventSource(NEST_API_URL, { headers: headers });

  const wss = new WSS({ port: 8081 });

  // When a connection is established
  wss.on('connection', socket => {
    console.log('Opened connection ');
    source.addEventListener('put', async event => {
      // If request > 2
      if (!firstRequest) {
        // Send to webapp nest cam detected smth
        console.log('detected motion');
        socket.send(JSON.stringify({ type: 'motionDetected' }));

        // Only recognize if new snapshot
        const data = JSON.parse(event.data).data.devices.cameras[deviceId];
        const motionDate = data.last_event.start_time;
        console.log('motionDate', motionDate);
        console.log('lastmotiondate', lastMotionDate);
        if (lastMotionDate !== motionDate) {
          console.log('TRYING TO RECOGNIZE PERSON');
          lastMotionDate = motionDate.toString();
          let recognizedPersonId;
          
          // Save image of person in front of camera
          await request(data.snapshot_url)
            .pipe(fs.createWriteStream('img/unknown.jpeg'))
            .on('close', async () => {
              // Already begin to upload to cloudinary
              const cloudinaryPromise = cloudinary.uploader.upload(
                UNKNOWN_PATH
              );
              const base64Img = fs
                .readFileSync(path.resolve(UNKNOWN_PATH))
                .toString('base64');
              socket.send(
                JSON.stringify({ type: 'snapshot', data: base64Img })
              );

              // Start recognizing via Kairos
              const recognizeResult = (await apiAgent
                .post('https://api.kairos.com/recognize')
                .send(
                  JSON.stringify({
                    image: base64Img,
                    gallery_name: 'DEMO',
                    max_num_results: 1,
                  })
                )).body;
              if (
                recognizeResult.Errors &&
                recognizeResult.Errors[0].ErrCode === 5002
              ) {
                // Not detected a face with Kairos, try with Face++
                console.log('Could not find face with Kairos');
                const url = await cloudinaryPromise;
                try {
                  const recognizeResult2 = (await agent
                    .post('https://api-us.faceplusplus.com/facepp/v3/search')
                    .query({
                      api_key: facePPKey,
                      api_secret: facePPSecret,
                      image_url: url.secure_url,
                      outer_id: 2,
                    })).body;
                  const person =
                    recognizeResult2.results &&
                    recognizeResult2.results[0] &&
                    (await facePPTokensModel
                      .findOne({
                        faceToken: recognizeResult2.results[0].face_token,
                      })
                      .exec());
                  console.log('person', person && person.imageId);
                  recognizedPersonId = person && person.imageId;
                } catch (e) {
                  console.log('facePP error ', e.message);
                }
              } else {
                // Detected face with Kairos
                console.log(
                  'recognizeresult',
                  recognizeResult.images[0].transaction
                );
                recognizedPersonId =
                  recognizeResult.images[0].transaction &&
                  recognizeResult.images[0].transaction.candidates[0]
                    .subject_id;
              }

              // Send the result to the webapp
              console.log('Check if person recognized');
              if (recognizedPersonId) {
                const name = names[recognizedPersonId.toString()];
                console.log('I recognized !', name);
                socket.send(
                  JSON.stringify({
                    type: 'recognizeResult',
                    data: name,
                    recognized: true,
                  })
                );
              } else {
                socket.send(
                  JSON.stringify({ type: 'recognizeResult', recognized: false })
                );
              }
            });
        }
      }
      firstRequest = false;
    });

    source.addEventListener('open', async event => {
      console.log('Connection opened!');
    });

    source.addEventListener('auth_revoked', event => {
      console.log('Authentication token was revoked.');
      // Re-authenticate your user here.
    });

    source.addEventListener(
      'error',
      event => {
        if (event.readyState == EventSource.CLOSED) {
          console.error('Connection was closed!', event);
        } else {
          console.error('An unknown error occurred: ', event);
        }
      },
      false
    );

    // When data is received
    socket.on('message', function(message) {
      console.log('Received: ' + message);
    });

    // The connection was closed
    socket.on('close', function() {
      console.log('Closed Connection ');
    });
  });
};

module.exports = startStreaming;
