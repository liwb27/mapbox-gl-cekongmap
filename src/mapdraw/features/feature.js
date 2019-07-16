// import { feature } from "@turf/turf";

// const hat = require('hat');

const Feature = function (ctx) {
    this.ctx = ctx;
    // this.properties = geojson.properties || {};
    // this.coordinates = geojson.geometry.coordinates;
    // this.type = geojson.geometry.type;

    // this.id = String(new Date().getTime());
    this.groupID = null;
    this.coordinates = [];
    this.feature = {};
};

Feature.prototype.changed = function () {
    this.ctx.map.getSource('geojson_draw').setData(this.ctx.geojson_draw);
};

Feature.prototype.setProperty = function (name, value) {
    for (i in this.ctx.geojson_draw.features) {
        if (this.ctx.geojson_draw.features[i].properties.id == this.id) {
            this.ctx.geojson_draw.features[i].properties[name] = value;
            break;
        }
    }
    this.changed();
};

Feature.prototype.setCoordinate = function (coord) {
    this.coordinates = coord;
    this.feature.geometry.coordinates = coord;
    this.changed();
};

Feature.prototype.activate = function () {
    this.feature.properties.active = 'true';
    this.changed();
}
    
Feature.prototype.deactivate = function () {
    this.feature.properties.active = 'false';
    this.changed();
}

Feature.prototype.isActive = function () {
    return this.feature.properties.active == 'true';    
}

Feature.prototype.getLayerIDs = function () {
    return [this.id];
}

Feature.prototype.getInfo = function () {
    const div = document.createElement('div');
    div.innerHTML = 'override this function to have your own feature info';
    return div;
}

Feature.prototype.setLayerProprety = function(layer, type, name, value) {
    this.layer[layer][type][name] = value;
    if (type == 'paint') {
        this.ctx.map.setPaintProperty(this.layer[layer].id, name, value);
    }
    else if (type == 'layout') {
        this.ctx.map.setLayoutProperty(this.layer[layer].id, name, value);        
    }
}


Feature.prototype.save = function() {
    return {
        'id':this.id,
        'type': this.type,
        'layer': this.layer,
        'feature': this.feature
    }
}

Feature.prototype.load = function(json) {
    this.id = json.id;
    this.type = json.type;
    if (this.ctx.map.getLayer(this.layer.inactive.id) != null) {
        this.ctx.map.removeLayer(this.layer.inactive.id);        
    }
    this.layer = json.layer;
    if (this.ctx.map.getLayer(this.layer.inactive.id) == null) {
        this.ctx.map.addLayer(this.layer.inactive);
    }
    this.setCoordinate(json.feature.geometry.coordinates)
    this.feature.properties.id = json.id;
    if ('title' in this.feature.properties) {
        this.feature.properties.title = json.feature.properties.title;
    }
    if ('image' in this.feature.properties) {
        this.feature.properties.image = json.feature.properties.image;
    }
    this.deactivate();
}

module.exports = Feature;

// 继承关系
// feature  --> point   --> text
//                      --> vertex
//          --> line    --> polygon --> rect
//                              |-- --> round   -->sector
//
