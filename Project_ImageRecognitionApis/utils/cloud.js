const fs = require('fs');
const cloudinary = require('cloudinary');
const _ = require('lodash');
const { models } = require('mongoose');
const { promisify } = require('util');
const { TYPESCOUNT } = require('./utils');
const readdir = promisify(fs.readdir);

const NULLARRAY = Array.apply(null, Array(TYPESCOUNT));

const paths = NULLARRAY.map((x, i) => './Type' + (i + 1) + '/');

const addImagesToCloudinaryAndSaveFilesToMongo = async () => {
  // Config cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Empty mongo db
  console.log('MONGO:: reset images DB');
  for (let i = 0; i < TYPESCOUNT; i++) {
    const type = 'Type' + (i + 1);
    const model = models[type];
    model && (await model.remove({}));
    await gettingImages(paths[i], model, i);
  }
};

const gettingImages = async (path, model, i) => {
  console.log('MONGO:: getting images...');
  const files = await readdir(path);
  if (files) {
    for (let file of files) {
      const id = _.split(file, '_')[0];
      console.log('CLOUDINARY:: upload image... ', id);
      const result = await cloudinary.uploader.upload(`${path}${file}`);
      const url = result.secure_url;
      console.log('CLOUDINARY:: url ', url);
      if (i !== 0) {
        await model.update(
          { imageId: id },
          { imageId: id, url },
          { upsert: true }
        );
      } else {
        await model.update(
          { imageId: id },
          { imageId: id, $push: { urls: url } },
          { upsert: true }
        );
      }
    }
  }
};

module.exports = {
  addImagesToCloudinaryAndSaveFilesToMongo,
};
