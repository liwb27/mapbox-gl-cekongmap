// const sortFeatures = require('./sort_features');
const mapEventToBoundingBox = require('./map_event_to_bounding_box');
const Constants = require('../constants');

const META_TYPES = [
  Constants.meta.FEATURE,
  Constants.meta.MIDPOINT,
  Constants.meta.VERTEX
];

// Requires either event or bbox
module.exports = {
  click: featuresAtClick,
  touch: featuresAtTouch
};

function featuresAtClick(event, bbox, ctx) {
  return featuresAt(event, bbox, ctx, ctx.options.clickBuffer);
}

function featuresAtTouch(event, bbox, ctx) {
  return featuresAt(event, bbox, ctx, ctx.options.touchBuffer);
}

function featuresAt(event, bbox, ctx, buffer) {
  if (ctx.map === null) return [];
  // 得到地图绘图元素

  const box = (event) ? mapEventToBoundingBox(event, buffer) : bbox;
  const queryParams = {};
  queryParams.layers = ctx.store.getAllLayers();

  const features = ctx.map.queryRenderedFeatures(box, queryParams) // 可以按需求过滤
    // .filter((feature) => {
    //   return META_TYPES.indexOf(feature.properties.meta) !== -1;
    // });

  // const featureIds = new StringSet();
  // const uniqueFeatures = [];
  // features.forEach((feature) => {
  //   const featureId = feature.properties.id;
  //   if (featureIds.has(featureId)) return;
  //   featureIds.add(featureId);
  //   uniqueFeatures.push(feature);
  // });

  // return sortFeatures(uniqueFeatures);
  return features;
}
