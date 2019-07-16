const Feature = require('../features/feature');
const Line = require('../features/line');
const Point = require('../features/point');
const Polygon = require('../features/polygon');
const Rect = require('../features/rect');
const Round = require('../features/round');
const Sector = require('../features/sector');
const Text = require('../features/text');
const Vertex = require('../features/vertex');

module.exports = function (type, ctx) {
    var feature;
    if (type == 'line') {
        feature = new Line(ctx);
    }
    else if (type == 'point') {
        feature = new Point(ctx);
    }
    else if (type == 'polygon') {
        feature = new Polygon(ctx);
    }
    else if (type == 'rect') {
        feature = new Rect(ctx);
    }
    else if (type == 'round') {
        feature = new Round(ctx);
    }
    else if (type == 'sector') {
        feature = new Sector(ctx);
    }
    else if (type == 'text') {
        feature = new Text(ctx);
    }
    else if (type == 'vertex') {
        feature = new Vertex(ctx);
    }
    return feature;
}    