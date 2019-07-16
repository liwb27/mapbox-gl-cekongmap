const Feature = require('./feature');
const Style = require('./style');
const Constants = require('../constants');
const createModal = require('../lib/createModal');
const tinyColorpicker = require('../lib/tinycolorpicker');


const Point = function (ctx) {
    Feature.call(this, ctx);

    this.id = 'Point' + String(new Date().getTime());
    this.type = 'point';
    this.layer = {};
    // this.layer.active = Style.point;
    // this.layer.active_stroke = Style.point_stroke;
    this.layer.inactive = {
        'id': this.id,
        'type': 'symbol',
        'source': 'geojson_draw',
        'filter': [
            'all', 
            ['==', 'active', 'false'],
            ['==', '$type', 'Point'],
            ['in', 'id', this.id],
        ],
        'layout': {
            'icon-image': "{image}",
            'icon-size': 1,
            'icon-allow-overlap': true,
            'icon-rotate': 0,
        },
        'paint': {
            'icon-color': '#000000',
        }
    }

    // //所有active公用一个layer，检查是否创建
    // if (this.ctx.map.getLayer(Style.point_stroke.id) == null) {
    //     this.ctx.map.addLayer(Style.point_stroke);
    // }
    // if (this.ctx.map.getLayer(Style.point.id) == null) {
    //     this.ctx.map.addLayer(Style.point);
    // }

    // 添加图层
    if (this.ctx.map.getLayer(this.layer.inactive.id) == null) {
        this.ctx.map.addLayer(this.layer.inactive);
    }
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
            "image": "map-marker-alt",
            'active': 'false',
            'meta': Constants.meta.FEATURE,
            'meta:type': this.type
        }
    }
    ctx.geojson_draw.features.push(this.feature);
}

Point.prototype = Object.create(Feature.prototype);

Point.prototype.destroy = function () {
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
    this.changed();
}

Point.prototype.move = function (delta) {
    this.coordinates[0]  += delta.lng;
    this.coordinates[1]  += delta.lat;
    this.changed();
}

Point.prototype.getInfo = function () {
    const div = document.createElement('div');
    const table = document.createElement('table');
    table.className = 'table table-bordered';
    var thead = document.createElement('thead');
    thead.innerHTML = ' \
    <thead><tr> \
    <th>Point</th> \
    <th>经度</th> \
    <th>纬度</th> \
    </tr></thead> \
    ';
    table.appendChild(thead);
    var tbody = document.createElement('tbody');
    table.appendChild(tbody);

    const tr = document.createElement('tr');
    tr.innerHTML = ' \
    <td>--</td> \
    <td>'+ this.coordinates[0] +'</td> \
    <td>'+ this.coordinates[1] +'</td> \
    '
    tbody.appendChild(tr);
    div.appendChild(table);
    return div;
}

Point.prototype.getEditModal = function() {
    const modal = createModal('editModal');
    const btn = modal.firstElementChild.firstElementChild.lastElementChild.lastElementChild;
    var modalbody = modal.firstElementChild.firstElementChild.children[1];
    modalbody.innerHTML += '<div class="form-group required"> \
                                <label class="control-label">坐标</label> \
                                <input class="form-control" id="editCoord" required type="text" value="'+ JSON.stringify(this.feature.geometry.coordinates) + '"> \
                            </div>'

    var div = document.createElement('div');
    modalbody.appendChild(div);
    div.className = 'form-group required';

    var label = document.createElement('label');
    label.className = "control-label";
    label.textContent = '图标';
    div.appendChild(label);

    var table = document.createElement('table');
    table.className = 'table table-bordered';
    div.appendChild(table);
    
    var colCount = 12;
    var j = 0;
    var imgIndex = 0;
    while(true) {
        if (j >= this.ctx.svgs.length)
            break;
        var tr = document.createElement('tr');
        tr.style = 'height:50px';
        table.appendChild(tr);
        for (var i=0; i<colCount; i++) {
            if (j >= this.ctx.svgs.length)
                break;
            var td = document.createElement('td');
            tr.appendChild(td);
            var input = document.createElement('input');
            input.type = 'radio';
            input.value = j;
            input.id = 'radio'+j;
            input.name = 'pointSymbol';
            input.onclick = function (event) {
                imgIndex = event.target.value;
            }
            td.appendChild(input);
            td.appendChild(this.ctx.svgs[j]);
            if (this.ctx.svgs[j].name == this.feature.properties.image) {
                input.checked = true;
                imgIndex = j;
            }
            j++;
        }
    }

    var div = document.createElement('div');
    modalbody.appendChild(div);
    div.className = 'form-group required';
    div.innerHTML += '<label class="control-label">旋转</label> \
                      <input class="form-control" id="editRotate" value="'+ this.layer.inactive.layout['icon-rotate'] + '">';

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
        <td><input id="editColor" class="form-control colorInput"/></td>\
    </tr></table>'
    div.appendChild(d);
    var picker = tinyColorpicker(d);
    picker.setColor(this.layer.inactive.paint['icon-color']);

    const point = this;
    btn.onclick = function () {
        var image = point.ctx.svgs[imgIndex].name;
        point.feature.properties.image = image;
        point.setCoordinate(JSON.parse(document.getElementById('editCoord').value));
        point.setLayerProprety('inactive', 'layout', 'icon-rotate', parseInt(document.getElementById('editRotate').value));        
        point.setLayerProprety('inactive', 'paint', 'icon-color', document.getElementById('editColor').value);
        
        point.deactivate();
        point.changed();
        document.body.removeChild(modal);
    }
}

module.exports = Point;
