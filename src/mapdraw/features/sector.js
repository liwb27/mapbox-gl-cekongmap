const Feature = require('./feature');
const Round = require('./round');
const Vertex = require('./vertex');
const Style = require('./style');
const Constants = require('../constants');
const createModal = require('../lib/createModal');
const Turf = require('@turf/turf');
const tinyColorpicker = require('../lib/tinycolorpicker');

const Sector = function (ctx) {
    Feature.call(this, ctx);

    this.id = 'Sector' + String(new Date().getTime());
    this.type = 'sector';
    this.steps = 100;//
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

Sector.prototype = Object.create(Round.prototype);

Sector.prototype.setBearing1 = function (lng, lat) {
    this.bearing1 = Turf.bearing(this.getCenter(), [lng, lat]);
    if (this.vertexes[1] == null) {
        const v = new Vertex(this.ctx);
        v.setCoordinate([lng, lat]);
        this.vertexes.push(v);
    }
    else {
        this.vertexes[1].setCoordinate([lng, lat]);
    }
}

Sector.prototype.setBearing2 = function (lng, lat) {
    this.bearing2 = Turf.bearing(this.getCenter(), [lng, lat]);
    if (this.vertexes[2] == null) {
        const v = new Vertex(this.ctx);
        v.setCoordinate([lng, lat]);
        this.vertexes.push(v);
    }
    else {
        this.vertexes[2].setCoordinate([lng, lat]);
    }
}

Sector.prototype.makeSector = function () {
    if (this.vertexes.length == 0) {
        return null;
    }
    if (this.bearing1 == null)
        return null;
    if (this.bearing2 == null)
        return null;
    if (this.R == null)
        return null;
    this.makeSectorWithParam(this.bearing1, this.bearing2, this.R);
}

Sector.prototype.makeSectorWithParam = function (bearing1, bearing2, R) {
    this.coordinates = Turf.sector(this.getCenter(), R, bearing1, bearing2, {steps: this.edge_count}).geometry.coordinates[0];
    var len = this.coordinates.length;
    var coord = this.coordinates[1];
    this.vertexes[1].setCoordinate([coord[0], coord[1]]);
    var coord = this.coordinates[len - 2];
    this.vertexes[2].setCoordinate([coord[0], coord[1]]);
    this.feature.geometry.coordinates = [this.coordinates];
    this.changed();
}

Sector.prototype.move = function (delta) {
    this.vertexes[0].move(delta);
    this.makeSector();
    this.changed();
}

Sector.prototype.getInfo = function () {
    const div = document.createElement('div');
    const table = document.createElement('table');
    table.className = 'table table-bordered';
    var thead = document.createElement('thead');
    thead.innerHTML = ' \
    <thead><tr> \
    <th>Sector</th> \
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
    <td>角度1</td> \
    <td colspan="5">' + this.bearing1 + '&nbsp;&nbsp;&nbsp;°</td> \
    '
    tbody.appendChild(tr);

    var tr = document.createElement('tr');
    tr.innerHTML = ' \
    <td>角度2</td> \
    <td colspan="5">' + this.bearing2 + '&nbsp;&nbsp;&nbsp;°</td> \
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

Sector.prototype.getEditModal = function () {
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
                                <label class="control-label">方位角-起始(°)</label> \
                                <input class="form-control" id="editBearing1" required type="text" value="'+ this.bearing1 + '"> \
                            </div>'
    modalbody.innerHTML += '<div class="form-group required"> \
                                <label class="control-label">方位角-结束(°)</label> \
                                <input class="form-control" id="editBearing2" required type="text" value="'+ this.bearing2 + '"> \
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

    const sector = this;
    btn.onclick = function () {
        // round.setCoordinate(JSON.parse(document.getElementById('editCoord').value));
        var center_coord = JSON.parse(document.getElementById('editCenter').value);
        sector.setCenter(center_coord[0], center_coord[1]);
        sector.R = parseFloat(document.getElementById('editR').value);
        sector.bearing1 = parseFloat(document.getElementById('editBearing1').value);
        sector.bearing2 = parseFloat(document.getElementById('editBearing2').value);  
        sector.makeSector();

        sector.setLayerProprety('fill_inactive', 'paint', 'fill-color', document.getElementById('editFillColor').value);
        sector.setLayerProprety('fill_inactive', 'paint', 'fill-opacity', parseFloat(document.getElementById('editFillOpacity').value));
        sector.setLayerProprety('stroke_inactive', 'paint', 'line-color', document.getElementById('editLineColor').value);
        sector.setLayerProprety('stroke_inactive', 'paint', 'line-opacity', parseFloat(document.getElementById('editLineOpacity').value));
        sector.setLayerProprety('stroke_inactive', 'paint', 'line-width', parseFloat(document.getElementById('editLineWidth').value));
        sector.deactivate();
        sector.changed();
        document.body.removeChild(modal);
    }
}

Sector.prototype.save = function() {
    return {
        'id':this.id,
        'type': this.type,
        'layer': this.layer,
        'feature': this.feature,
        'R': this.R,
        'center': this.getCenter(),
        'bearing1': this.bearing1,
        'bearing2': this.bearing2,
    }
}

Sector.prototype.load = function(json) {
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
    this.setCenter(json.center[0], json.center[1]);    
    this.bearing1 = json.bearing1;
    this.bearing2 = json.bearing2;
    this.vertexes.push(new Vertex(this.ctx));
    this.vertexes.push(new Vertex(this.ctx));
    this.makeSector();

    this.deactivate();
}


module.exports = Sector;
