const Feature = require('./feature');
const Style = require('./style');
const Constants = require('../constants');

const Vertex = function (ctx) {
    Feature.call(this, ctx);

    this.id = 'Vertex' + String(new Date().getTime());
    this.type = 'vertex';
    this.layer = {};
    // this.layer.active = Style.point;
    // this.layer.active_stroke = Style.point_stroke;

    //feature
    this.feature = {
        'type': "Feature",
        'geometry': {
            'type': "Point",
            'coordinates': this.coordinates
            // 'coordinates': [100,40]
        },
        "properties": {
            'id': this.id,
            "image": "marker_11",
            'active': 'true',
            'meta': Constants.meta.FEATURE,
            'meta:type': this.type
        }
    }
    ctx.geojson_draw.features.push(this.feature);    
}

Vertex.prototype = Object.create(Feature.prototype);

Vertex.prototype.destroy = function () {
    // 删除数据源
    for (i in this.ctx.geojson_draw.features) {
        if (this.ctx.geojson_draw.features[i].properties.id == this.id) {
            this.ctx.geojson_draw.features.splice(i, 1);
            break;
        }
    }
    this.changed();
}

Vertex.prototype.move = function (delta) {
    this.coordinates[0]  += delta.lng;
    this.coordinates[1]  += delta.lat;
    this.changed();
}

Vertex.prototype.getInfo = function () {
    
}

Vertex.prototype.getEditModal = function () {
    
}

module.exports = Vertex;
