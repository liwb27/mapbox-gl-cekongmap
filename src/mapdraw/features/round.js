const Feature = require('./feature');
const Polygon = require('./polygon');
const Vertex = require('./vertex');
const Style = require('./style');
const Constants = require('../constants');
const createModal = require('../lib/createModal');
const Turf = require('@turf/turf');
const tinyColorpicker = require('../lib/tinycolorpicker');

const Round = function (ctx) {
    Feature.call(this, ctx);

    this.id = 'Round' + String(new Date().getTime());
    this.type = 'round';
    this.edge_count = 100;// 多边形边数
    this.vertexes = [];
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

Round.prototype = Object.create(Polygon.prototype);

Round.prototype.addCoordinate = function (path, lng, lat) {
};

Round.prototype.getCoordinate = function (path) {
};

Round.prototype.removeCoordinate = function (path) {
};

Round.prototype.updateCoordinate = function (path, lng, lat) {
};

Round.prototype.setCenter = function (lng, lat) {
    if (this.vertexes.length == 0) {
        const v = new Vertex(this.ctx);
        v.setCoordinate([lng, lat]);
        this.vertexes.push(v);
    }
    else {
        this.vertexes[0].setCoordinate([lng, lat]);
    }
    this.activate();
};

Round.prototype.getCenter = function () {
    if (this.vertexes.length == 0) {
        return null;
    }        
    else {
        return [this.vertexes[0].coordinates[0],this.vertexes[0].coordinates[1]];
    }
}

Round.prototype.makeRoundWithCoord = function (lng, lat) {
    if (this.vertexes.length == 0) {
        return null;
    }
    var tmpline = {
        'type':"Feature",
        'geometry': {
            'type': "LineString",
            'coordinates': [
                this.getCenter(),
                [lng, lat]
            ]
        },
    };
    const R = Turf.lineDistance(tmpline);
    this.makeRoundWithR(R);
}
    
Round.prototype.makeRoundWithR = function (R) {
    if (this.vertexes.length == 0) {
        return null;
    }
    this.R = R;
    this.coordinates = Turf.circle(this.getCenter(), this.R, {steps: this.edge_count, units:'kilometers'}).geometry.coordinates[0];
    this.feature.geometry.coordinates = [this.coordinates];
    this.changed();
}

Round.prototype.move = function (delta) {
    // // 用turf计算出的圆第一点和最后一点使用的是同一个变量，因此移动时跳过最后一点，避免重复计算
    // for (var i = 0; i < (this.coordinates.length - 1); i++) {
    //     this.coordinates[i][0]  += delta.lng;
    //     this.coordinates[i][1]  += delta.lat;
    // }
    
    this.vertexes[0].move(delta);
    this.makeRoundWithR(this.R);

    this.changed();
}

Round.prototype.getInfo = function () {
    const div = document.createElement('div');
    const table = document.createElement('table');
    table.className = 'table table-bordered';
    var thead = document.createElement('thead');
    thead.innerHTML = ' \
    <thead><tr> \
    <th>Round</th> \
    <th colspan="5"></th> \
    </tr></thead> \
    ';
    table.appendChild(thead);
    var tbody = document.createElement('tbody');
    table.appendChild(tbody);

    var tr = document.createElement('tr');
    tr.innerHTML = ' \
    <td>圆心</td> \
    <td colspan="5">' + this.getCenter() + '</td> \
    '
    tbody.appendChild(tr);

    var tr = document.createElement('tr');
    tr.innerHTML = ' \
    <td>半径</td> \
    <td colspan="5">' + this.R + '&nbsp;&nbsp;&nbsp;km</td> \
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

Round.prototype.getEditModal = function () {
    const modal = createModal('editModal');
    const btn = modal.firstElementChild.firstElementChild.lastElementChild.lastElementChild;
    var modalbody = modal.firstElementChild.firstElementChild.children[1];

    modalbody.innerHTML += '<div class="form-group required"> \
                                <label class="control-label">圆心坐标</label> \
                                <input class="form-control" id="editCenter" required type="text" value="'+ JSON.stringify(this.getCenter())+ '"> \
                            </div>'
    modalbody.innerHTML += '<div class="form-group required"> \
                                <label class="control-label">半径(km)</label> \
                                <input class="form-control" id="editR" required type="text" value="'+ this.R + '"> \
                            </div>'
    modalbody.innerHTML += '<div class="form-group required"> \
                                <label class="control-label">光滑度</label> \
                                <input class="form-control" id="editPolygonEdgeCount" required type="text" value="'+ this.edge_count + '"> \
                            </div>'
    // modalbody.innerHTML += '<div class="form-group required"> \
    //                             <label class="control-label">填充颜色</label> \
    //                             <input class="form-control" id="editFillColor" required type="text" value="'+ this.layer.fill_inactive.paint['fill-color'] + '"> \
    //                         </div>'
    modalbody.innerHTML += '<div class="form-group required"> \
                                <label class="control-label">填充透明度</label> \
                                <input class="form-control" id="editFillOpacity" required type="text" value="'+ this.layer.fill_inactive.paint['fill-opacity'] + '"> \
                            </div>'
    // modalbody.innerHTML += '<div class="form-group required"> \
    //                             <label class="control-label">边线颜色</label> \
    //                             <input class="form-control" id="editLineColor" required type="text" value="'+ this.layer.stroke_inactive.paint['line-color'] + '"> \
    //                         </div>'
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

    const round = this;
    btn.onclick = function () {
        // round.setCoordinate(JSON.parse(document.getElementById('editCoord').value));
        var center_coord = JSON.parse(document.getElementById('editCenter').value);
        round.setCenter(center_coord[0], center_coord[1]);
        round.edge_count = parseInt(document.getElementById('editPolygonEdgeCount').value);
        round.R = parseFloat(document.getElementById('editR').value);
        round.makeRoundWithR(round.R);

        round.setLayerProprety('fill_inactive', 'paint', 'fill-color', document.getElementById('editFillColor').value);
        round.setLayerProprety('fill_inactive', 'paint', 'fill-opacity', parseFloat(document.getElementById('editFillOpacity').value));
        round.setLayerProprety('stroke_inactive', 'paint', 'line-color', document.getElementById('editLineColor').value);
        round.setLayerProprety('stroke_inactive', 'paint', 'line-opacity', parseFloat(document.getElementById('editLineOpacity').value));
        round.setLayerProprety('stroke_inactive', 'paint', 'line-width', parseFloat(document.getElementById('editLineWidth').value));
        round.deactivate();
        round.changed();
        document.body.removeChild(modal);
    }
}

Round.prototype.save = function() {
    return {
        'id':this.id,
        'type': this.type,
        'layer': this.layer,
        // 'feature': this.feature,
        'R': this.R,
        'center': this.getCenter(),
        'edge_count': this.edge_count
    }
}

Round.prototype.load = function(json) {
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

    this.feature.properties.id = json.id;
    this.R = json.R;
    this.edge_count = json.edge_count;
    this.setCenter(json.center[0], json.center[1]);
    this.makeRoundWithR(json.R);
    this.deactivate();
}

module.exports = Round;
