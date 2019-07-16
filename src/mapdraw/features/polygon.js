const Feature = require('./feature');
const Vertex = require('./vertex');
const Line = require('./line');
const Style = require('./style');
const Constants = require('../constants');
const createModal = require('../lib/createModal');
const Turf = require('@turf/turf');
const tinyColorpicker = require('../lib/tinycolorpicker');

const Polygon = function (ctx) {
    Feature.call(this, ctx);

    this.id = 'Polygon' + String(new Date().getTime());
    this.type = 'polygon';
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

Polygon.prototype = Object.create(Line.prototype);

Polygon.prototype.destroy = function () {
    // 删除图层
    if (this.ctx.map.getLayer(this.layer.fill_inactive.id) != null) {
        this.ctx.map.removeLayer(this.layer.fill_inactive.id);
    }
    if (this.ctx.map.getLayer(this.layer.stroke_inactive.id) != null) {
        this.ctx.map.removeLayer(this.layer.stroke_inactive.id);
    }

    // 删除数据源
    for (i in this.ctx.geojson_draw.features) {
        if (this.ctx.geojson_draw.features[i].properties.id == this.id) {
            this.ctx.geojson_draw.features.splice(i, 1);
            break;
        }
    }
    for (var i in this.vertexes) {
        this.vertexes[i].destroy();
    }
    this.changed();
}

Polygon.prototype.getLayerIDs = function () {
    return [this.layer.fill_inactive.id, this.layer.stroke_inactive.id];
}

Polygon.prototype.move = function (delta) {
    for (i in this.coordinates) {
        this.coordinates[i][0]  += delta.lng;
        this.coordinates[i][1]  += delta.lat;
    }
    for(var i in this.vertexes)
        this.vertexes[i].move(delta);
    this.changed();
}

Polygon.prototype.setCoordinate = function (coord) {
    this.coordinates = coord[0];
    this.feature.geometry.coordinates = [this.coordinates];
    for (var i in this.vertexes) {
        this.vertexes[i].destroy();
    }
    this.vertexes = [];
    for (var i in coord[0]) {
        const vertex = new Vertex(this.ctx);
        vertex.setCoordinate([coord[0][i][0],coord[0][i][1]]);
        this.vertexes.push(vertex);
    }
    this.changed();
};

Polygon.prototype.getInfo = function () {
    const div = document.createElement('div');
    const table = document.createElement('table');
    table.className = 'table table-bordered';
    var thead = document.createElement('thead');
    thead.innerHTML = ' \
    <thead><tr> \
    <th>Polygon</th> \
    <th>起点经度</th> \
    <th>起点纬度</th> \
    <th>终点经度</th> \
    <th>终点纬度</th> \
    <th>长度(km)</th> \
    </tr></thead> \
    ';
    table.appendChild(thead);
    var tbody = document.createElement('tbody');
    table.appendChild(tbody);

    var tmpline = {
        'type':"Feature",
        'geometry': {
            'type': "LineString",
            'coordinates': []
        },
    };
    var totalDistance = 0;
    for (var i = 1; i < this.coordinates.length; i++) {
        tmpline.geometry.coordinates = [this.coordinates[i-1], this.coordinates[i]];
        const distance = Turf.lineDistance(tmpline);
        totalDistance += distance;
        const tr = document.createElement('tr');
        tr.innerHTML = ' \
        <td>' + i + '</td> \
        <td>' + this.coordinates[i-1][0] + '</td> \
        <td>' + this.coordinates[i-1][1] + '</td> \
        <td>' + this.coordinates[i][0] + '</td> \
        <td>' + this.coordinates[i][1] + '</td> \
        <td>' + distance + '</td> \
        '
        tbody.appendChild(tr);
    }
    var tr = document.createElement('tr');
    tr.innerHTML = ' \
    <td>合计</td> \
    <td>--</td> \
    <td>--</td> \
    <td>--</td> \
    <td>--</td> \
    <td colspan="5">' + totalDistance + '</td> \
    '
    tbody.appendChild(tr);

    var tr = document.createElement('tr');
    tr.innerHTML = ' \
    <td>面积</td> \
    <td colspan="5">' + Turf.area(this.feature)/1000000 + '&nbsp;&nbsp;&nbsp;km<sup>2</sup></td> \
    '
    tbody.appendChild(tr);

    div.appendChild(table);
    return div;
}

Polygon.prototype.getEditModal = function () {
    const modal = createModal('editModal');
    const btn = modal.firstElementChild.firstElementChild.lastElementChild.lastElementChild;
    var modalbody = modal.firstElementChild.firstElementChild.children[1];


    modalbody.innerHTML += '<div class="form-group required"> \
                                <label class="control-label">坐标</label> \
                                <input class="form-control" id="editCoord" required type="text" value="'+ JSON.stringify(this.feature.geometry.coordinates)+ '"> \
                            </div>'
    modalbody.innerHTML += '<div class="form-group required"> \
                                <label class="control-label">填充透明度</label> \
                                <input class="form-control" id="editFillOpacity" required type="text" value="'+ this.layer.fill_inactive.paint['fill-opacity'] + '"> \
                            </div>'
    modalbody.innerHTML += '<div class="form-group required"> \
                                <label class="control-label">边线透明度</label> \
                                <input class="form-control" id="editLineOpacity" required type="text" value="'+ this.layer.stroke_inactive.paint['line-opacity'] + '"> \
                            </div>'
    modalbody.innerHTML += '<div class="form-group required"> \
                                <label class="control-label">边线宽度</label> \
                                <input class="form-control" id="editLineWidth" required type="text" value="'+ this.layer.stroke_inactive.paint['line-width'] + '"> \
                            </div>'

    var div = document.createElement('div');
    modalbody.appendChild(div);
    div.className = 'form-group required';
    div.innerHTML += '<label class="control-label">填充颜色</label>';
    var d = document.createElement('div');
    d.id = "colorPicker";
    d.innerHTML = '\
    <table class="table table-bordered"><tr>\
        <td><div class="color"></div>\
        <div class="track"></div></td>\
        <td><input id="editFillColor" class="form-control colorInput"/></td>\
    </tr></table>'
    div.appendChild(d);
    var picker = tinyColorpicker(d);
    picker.setColor(this.layer.stroke_inactive.paint['line-color']);

    var div = document.createElement('div');
    modalbody.appendChild(div);
    div.className = 'form-group required';
    div.innerHTML += '<label class="control-label">边线颜色</label>';
    var d = document.createElement('div');
    d.id = "colorPicker";
    d.innerHTML = '\
    <table class="table table-bordered"><tr>\
        <td><div class="color"></div>\
        <div class="track"></div></td>\
        <td><input id="editLineColor" class="form-control colorInput"/></td>\
    </tr></table>'
    div.appendChild(d);
    var picker = tinyColorpicker(d);
    picker.setColor(this.layer.stroke_inactive.paint['line-color']);

    const polygon = this;
    btn.onclick = function () {
        polygon.setCoordinate(JSON.parse(document.getElementById('editCoord').value));
        polygon.setLayerProprety('fill_inactive', 'paint', 'fill-color', document.getElementById('editFillColor').value);
        polygon.setLayerProprety('fill_inactive', 'paint', 'fill-opacity', parseFloat(document.getElementById('editFillOpacity').value));
        polygon.setLayerProprety('stroke_inactive', 'paint', 'line-color', document.getElementById('editLineColor').value);
        polygon.setLayerProprety('stroke_inactive', 'paint', 'line-opacity', parseFloat(document.getElementById('editLineOpacity').value));
        polygon.setLayerProprety('stroke_inactive', 'paint', 'line-width', parseFloat(document.getElementById('editLineWidth').value));
        polygon.deactivate();
        polygon.changed();
        document.body.removeChild(modal);
    }
}

Polygon.prototype.load = function(json) {
    this.id = json.id;
    this.type = json.type;
    if (this.ctx.map.getLayer(this.layer.fill_inactive.id) != null) {
        this.ctx.map.removeLayer(this.layer.fill_inactive.id);
    }
    if (this.ctx.map.getLayer(this.layer.stroke_inactive.id) != null) {
        this.ctx.map.removeLayer(this.layer.stroke_inactive.id);
    }
    this.layer = json.layer;    
    if (this.ctx.map.getLayer(this.layer.fill_inactive.id) == null) {
        this.ctx.map.addLayer(this.layer.fill_inactive);
    }
    if (this.ctx.map.getLayer(this.layer.stroke_inactive.id) == null) {
        this.ctx.map.addLayer(this.layer.stroke_inactive);
    }

    this.setCoordinate(json.feature.geometry.coordinates)
    this.feature.properties.id = json.id;
    this.deactivate();
}

module.exports = Polygon;
