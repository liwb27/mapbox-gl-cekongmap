const Feature = require('./feature');
const Vertex = require('./vertex');
const Style = require('./style');
const Constants = require('../constants');
const Turf = require('@turf/turf');
const createModal = require('../lib/createModal');
const tinyColorpicker = require('../lib/tinycolorpicker');

const Line = function (ctx) {
    Feature.call(this, ctx);

    this.id = 'Line' + String(new Date().getTime());
    this.type = 'line';
    this.vertexes = []
    this.layer = {};
    // this.layer.active = Style.line;
    this.layer.inactive = {
        'id': this.id,
        'type': 'line',
        'source': 'geojson_draw',
        'filter': [
            'all', 
            ['==', 'active', 'false'],
            ['==', '$type', 'LineString'],
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
    if (ctx.map.getLayer(this.layer.inactive.id) == null) {
        ctx.map.addLayer(this.layer.inactive);
    }
    //feature
    this.feature = {
        'type': "Feature",
        'geometry': {
            'type': "LineString",
            'coordinates': this.coordinates
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
    // ctx.map.getSource('geojson_draw').setData(ctx.geojson_draw);
};

Line.prototype = Object.create(Feature.prototype);

// Line.prototype.isValid = function () {
//     return this.coordinates.length > 1;
// };

Line.prototype.addCoordinate = function (path, lng, lat) {
    const id = parseInt(path, 10);
    this.coordinates.splice(id, 0, [lng, lat]);
    const vertex = new Vertex(this.ctx);
    vertex.setCoordinate([lng, lat]);
    this.vertexes.splice(id, 0, vertex);
    this.changed();
};

Line.prototype.getCoordinate = function (path) {
    const id = parseInt(path, 10);
    return JSON.parse(JSON.stringify(this.coordinates[id]));
};

Line.prototype.setCoordinate = function (coord) {
    this.coordinates = coord;
    this.feature.geometry.coordinates = coord;
    for (var i in this.vertexes) {
        this.vertexes[i].destroy();
    }
    this.vertexes = [];
    for (var i in coord) {
        const vertex = new Vertex(this.ctx);
        vertex.setCoordinate([coord[i][0],coord[i][1]]);
        this.vertexes.push(vertex);
    }
    this.changed();
};

Line.prototype.removeCoordinate = function (path) {
    this.coordinates.splice(parseInt(path, 10), 1);
    const vertex_to_del = this.vertexes.splice(parseInt(path, 10), 1);
    if (vertex_to_del.length)
        vertex_to_del[0].destroy();
    this.changed();
};

Line.prototype.updateCoordinate = function (path, lng, lat) {
    const id = parseInt(path, 10);
    this.coordinates[id] = [lng, lat];
    this.vertexes[id].setCoordinate([lng, lat]);
    this.changed();
};

Line.prototype.destroy = function () {
    // 删除图层
    if (this.ctx.map.getLayer(this.layer.inactive.id) != null) {
        this.ctx.map.removeLayer(this.layer.inactive.id);
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

Line.prototype.move = function (delta) {
    for (i in this.feature.geometry.coordinates) {
        this.coordinates[i][0]  += delta.lng;
        this.coordinates[i][1]  += delta.lat;
    }
    for(var i in this.vertexes)
        this.vertexes[i].move(delta);
    this.changed();
}
    
Line.prototype.activate = function () {
    this.feature.properties.active = 'true';
    for(var i in this.vertexes)
        this.vertexes[i].activate();
    this.changed();
}
    
Line.prototype.deactivate = function () {
    this.feature.properties.active = 'false';
    for(var i in this.vertexes)
        this.vertexes[i].deactivate();
    this.changed();
}

Line.prototype.getInfo = function () {
    const div = document.createElement('div');
    const table = document.createElement('table');
    table.className = 'table table-bordered';
    var thead = document.createElement('thead');
    thead.innerHTML = ' \
    <thead><tr> \
    <th>Line</th> \
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
    const tr = document.createElement('tr');
    tr.innerHTML = ' \
    <td>合计</td> \
    <td>--</td> \
    <td>--</td> \
    <td>--</td> \
    <td>--</td> \
    <td>' + totalDistance + '</td> \
    '
    tbody.appendChild(tr);
    div.appendChild(table);
    return div;
}

Line.prototype.getEditModal = function () {
    const modal = createModal('editModal');
    const btn = modal.firstElementChild.firstElementChild.lastElementChild.lastElementChild;
    var modalbody = modal.firstElementChild.firstElementChild.children[1];

    modalbody.innerHTML += '<div class="form-group required"> \
                                <label class="control-label">坐标</label> \
                                <input class="form-control" id="editCoord" required type="text" value="'+ JSON.stringify(this.feature.geometry.coordinates) + '"> \
                            </div>'

    // modalbody.innerHTML += '<div class="form-group required"> \
    //                             <label class="control-label">直线颜色</label> \
    //                             <input class="form-control" id="editLineColor" required type="text" value="'+ this.layer.inactive.paint['line-color']+ '"> \
    //                         </div>'
    modalbody.innerHTML += '<div class="form-group required"> \
                                <label class="control-label">线宽</label> \
                                <input class="form-control" id="editLineWidth" required type="text" value="'+ this.layer.inactive.paint['line-width']+ '"> \
                            </div>'
    modalbody.innerHTML += '<div class="form-group required"> \
                            <label class="control-label">透明度</label> \
                            <input class="form-control" id="editLineOpacity" required type="text" value="'+ this.layer.inactive.paint['line-opacity'] + '"> \
                        </div>'

    var div = document.createElement('div');
    modalbody.appendChild(div);
    div.className = 'form-group required';
    div.innerHTML += '<label class="control-label">颜色</label>';
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
    picker.setColor(this.layer.inactive.paint['line-color']);

    const line = this;
    btn.onclick = function () {
        line.setCoordinate(JSON.parse(document.getElementById('editCoord').value));
        line.setLayerProprety('inactive', 'paint', 'line-color', document.getElementById('editLineColor').value);
        line.setLayerProprety('inactive', 'paint', 'line-width', parseFloat(document.getElementById('editLineWidth').value));
        line.setLayerProprety('inactive', 'paint', 'line-opacity', parseFloat(document.getElementById('editLineOpacity').value));        
        line.deactivate();
        line.changed();
        document.body.removeChild(modal);
    }
}

module.exports = Line;