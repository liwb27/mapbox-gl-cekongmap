const Feature = require('./feature');
const Polygon = require('./polygon');

const Style = require('./style');
const Constants = require('../constants');
const createModal = require('../lib/createModal');

const Turf = require('@turf/turf');

const Rect = function (ctx) {
    Feature.call(this, ctx);

    this.id = 'Rect' + String(new Date().getTime());
    this.type = 'rect';
    this.vertexes = []
    this.layer = {};
    // this.layer.fill_active = Style.polygon_fill;
    // this.layer.stroke_active = Style.polygon_stroke;
    
    this.layer.fill_inactive = {
        'id': this.id + '-fill',
        'source': 'geojson_draw',        
        'type': 'fill',
        'filter': ['all',
            ['==', 'active', 'false'],
            ['==', '$type', 'Polygon'],
            ['!=', 'mode', 'static'],
            ['in', 'id', this.id],
        ],
        'paint': {
            'fill-color': '#3bb2d0',
            'fill-outline-color': '#3bb2d0',
            'fill-opacity': 0.1
        }
    };

    this.layer.stroke_inactive = {
        'id': this.id + '-stroke',
        'source': 'geojson_draw',        
        'type': 'line',
        'filter': ['all',
            ['==', 'active', 'false'],
            ['==', '$type', 'Polygon'],
            ['!=', 'mode', 'static'],
            ['in', 'id', this.id],
        ],
        'layout': {
            'line-cap': 'round',
            'line-join': 'round'
        },
        'paint': {
            'line-color': '#3bb2d0',
            'line-width': 2,
            'line-opacity': 1
        }
    };

    // 添加图层
    if (ctx.map.getLayer(this.layer.fill_inactive.id) == null) {
        ctx.map.addLayer(this.layer.fill_inactive);
    }
    if (ctx.map.getLayer(this.layer.stroke_inactive.id) == null) {
        ctx.map.addLayer(this.layer.stroke_inactive);
    }

    //feature
    this.feature = {
        'type': "Feature",
        'geometry': {
            'type': "Polygon",
            'coordinates': [this.coordinates]
        },
        "properties": {
            'id': this.id,
            'active': 'true',
            'meta': Constants.meta.FEATURE,
            'meta:type': this.type
        }
    }
    // 添加feature到地图源
    ctx.geojson_draw.features.push(this.feature);
};

Rect.prototype = Object.create(Polygon.prototype);

Rect.prototype.rotate = function (rotate_degree, pivot = this.coordinates[0]) {
    var new_rect = Turf.transformRotate(this.feature, rotate_degree, {'pivot': pivot});//旋转后的矩形
    this.coordinates = new_rect.geometry.coordinates[0];
    this.feature.geometry.coordinates = [this.coordinates];
    for (i=0; i<(this.vertexes.length-1); i++)
        // 这里必须用这种形式，否则会造成vertex与this.feature.geometry.coordinates中关联
        this.vertexes[i].setCoordinate([new_rect.geometry.coordinates[0][i][0],new_rect.geometry.coordinates[0][i][1]]);
    this.changed();
}

module.exports = Rect;
