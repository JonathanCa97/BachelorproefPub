const { TYPESCOUNT } = require('./utils');
const mongoose = require('mongoose');

const type1Schema = mongoose.Schema({
  imageId: Number,
  urls: [String],
});

const typeSchema = mongoose.Schema({
  imageId: Number,
  url: String,
});

const models = Array.apply(null, Array(TYPESCOUNT)).reduce(
  (x, b, i) => ({
    ...x,
    ['Type' + (i + 1)]: mongoose.model(
      'Type' + (i + 1),
      i === 0 ? type1Schema : typeSchema
    ),
  }),
  {}
);

module.exports = {
  models,
};
