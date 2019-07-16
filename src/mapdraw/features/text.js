const Feature = require('./feature');
const Point = require('./point');
const Style = require('./style');
const Constants = require('../constants');
const createModal = require('../lib/createModal');
const tinyColorpicker = require('../lib/tinycolorpicker');

const Text = function (ctx) {
    Feature.call(this, ctx);

    this.id = 'Text' + String(new Date().getTime());
    this.type = 'text';
    this.layer = {};
    // this.layer.active = Style.text;
    this.layer.inactive = {
        'id': this.id,
        'source': 'geojson_draw',    
        'type': 'symbol',
        'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta:type', 'text']],
        'layout': {
            'text-field': "{title}",
            'text-font': ['Noto Sans Regular'],
            'text-offset': [0, -0.5],
            'text-anchor': "top",
            'text-size': 18,
            'text-allow-overlap': true,
        },
        'paint': {
            'text-color': '#000000',
        }
    }

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
        },
        "properties": {
            'id': this.id,
            "image": "marker_11",
            // "title": this.text,
            "title": '',
            'active': 'false',
            'meta': Constants.meta.FEATURE,
            'meta:type': this.type
        }
    }

    ctx.geojson_draw.features.push(this.feature);   
};

Text.prototype = Object.create(Point.prototype);

Text.prototype.setText = function (text) {
    this.feature.properties.title = text;
    this.changed();
}
    
Text.prototype.getInfo = function () {
    const div = document.createElement('div');
    const table = document.createElement('table');
    table.className = 'table table-bordered';
    var thead = document.createElement('thead');
    thead.innerHTML = ' \
    <thead><tr> \
    <th>Text</th> \
    <th>经度</th> \
    <th>纬度</th> \
    <th>文字</th> \
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
    <td>'+ this.feature.properties.title +'</td> \
    '
    tbody.appendChild(tr);
    div.appendChild(table);
    return div;
}

Text.prototype.getEditModal = function() {
    const modal = createModal('editModal');
    const btn = modal.firstElementChild.firstElementChild.lastElementChild.lastElementChild;
    var modalbody = modal.firstElementChild.firstElementChild.children[1];
    modalbody.innerHTML += '<div class="form-group required"> \
                                <label class="control-label">显示信息</label> \
                                <input class="form-control" id="editTitle" required type="text" value="'+ this.feature.properties.title+ '"> \
                            </div>'
    modalbody.innerHTML += '<div class="form-group required"> \
                                <label class="control-label">坐标</label> \
                                <input class="form-control" id="editCoord" required type="text" value="'+ JSON.stringify(this.feature.geometry.coordinates) + '"> \
                            </div>'
    modalbody.innerHTML += '<div class="form-group required"> \
                                <label class="control-label">字体大小</label> \
                                <input class="form-control" id="editTextSize" required type="text" value="'+ this.layer.inactive.layout['text-size']+ '"> \
                            </div>'
    // modalbody.innerHTML += '<div class="form-group required"> \
    //                             <label class="control-label">字体颜色</label> \
    //                             <input class="form-control" id="editTextColor" required type="text" value="'+ this.layer.inactive.paint['text-color']+ '"> \
    //                         </div>'

    var div = document.createElement('div');
    modalbody.appendChild(div);
    div.className = 'form-group required';
    div.innerHTML += '<label class="control-label">字体颜色</label>';
    var d = document.createElement('div');
    d.id = "colorPicker";
    d.innerHTML = '\
    <table class="table table-bordered"><tr>\
        <td><div class="color"></div>\
        <div class="track"></div></td>\
        <td><input id="editTextColor" class="form-control colorInput"/></td>\
    </tr></table>'
    div.appendChild(d);
    var picker = tinyColorpicker(d);
    picker.setColor(this.layer.inactive.paint['text-color']);

    // modalbody.innerHTML += '<div class="form-group required"> \
    //                             <label class="control-label">文字偏移</label> \
    //                             <input class="form-control" id="editTextOffset" required type="text" value="'+ JSON.stringify(this.layer.inactive.layout['text-offset'])+ '"> \
    //                         </div>'
    // modalbody.innerHTML += '<div class="form-group required"> \
    //                             <label class="control-label">文字锚点</label> \
    //                             <select class="form-control" id="editTextAnchor"> \
    //                                 <option value="top">上</option> \
    //                                 <option value="bottom">下</option> \
    //                                 <option value="left">左</option> \
    //                                 <option value="right">右</option> \
    //                                 <option value="top-left">左上</option> \
    //                                 <option value="top-right">右上</option> \
    //                                 <option value="bottom-left">左下</option> \
    //                                 <option value="bottom-right">右下</option> \
    //                             </select> \
    //                         </div>'
    // document.getElementById('editTextAnchor').value = this.layer.inactive.layout['text-anchor'];//设置选中元素
    const text = this;    
    btn.onclick = function () {
        var title = document.getElementById('editTitle').value;
        var text_size = parseInt(document.getElementById('editTextSize').value);
        var text_color = document.getElementById('editTextColor').value;
        // var text_offset = JSON.parse(document.getElementById('editTextOffset').value);
        // var text_anchor = document.getElementById('editTextAnchor').value;
        
        text.feature.properties.title = title;
        text.setLayerProprety('inactive', 'paint', 'text-color', text_color);
        text.setLayerProprety('inactive', 'layout', 'text-size', text_size);
        // text.setLayerProprety('inactive', 'layout', 'text-offset', text_offset);
        // text.setLayerProprety('inactive', 'layout', 'text-anchor', text_anchor);
        text.setCoordinate(JSON.parse(document.getElementById('editCoord').value));

        text.deactivate();
        text.changed();
        document.body.removeChild(modal);
    }
}    

module.exports = Text;
