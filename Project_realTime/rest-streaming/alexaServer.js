//Start up server: node index.js
const express = require('express');
const bodyParser = require('body-parser');
const superagent = require('superagent');
const app = express();
const port = 5555;
const reminders = require('alexa-reminders');
const startStreaming = require('./nestcamListener');
const exec = require('child_process').exec;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

let reactAppExecutor;

//Docs for response and request json Alexa: https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference
const prepareJSONforAlexa = (version, text) => {
  return {
    version: version,
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: text,
      },
      shouldEndSession: true,
    },
  };
};

app.post('/startDemo', async (request, response) => {
  //Getting the request from Amazon
  const body = request.body;
  const version = body.version;
  const newSession = body.session.new;
  console.log('request', body.context.System);
  console.log('headers', request.headers);

  if (!body.session.user.accessToken) {
    response.setHeader('Content-Type', 'application/json;charset=UTF-8');
    response.send({
      version,
      response: {
        outputSpeech: {
          type: 'PlainText',
          text:
            ' Please use the companion app to authenticate on Amazon to start using this skill',
        },
        card: {
          type: 'LinkAccount',
        },
        shouldEndSession: true,
      },
      sessionAttributes: {},
    });
  } else if (newSession) {
    response.setHeader('Content-Type', 'application/json;charset=UTF-8');
    response.send(
      prepareJSONforAlexa(
        version,
        'I started the demo. You can now show the jury some cool stuf'
      )
    );
    reactAppExecutor = await exec('cd ./demo && npm start');
    startStreaming();
  }
});

app.listen(port, err => {
  if (err) {
    return console.log('something bad happened', err);
  }
  console.log(`server is listening on ${port}`);
});
