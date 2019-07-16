const Style = require('./features/style');
const createFeature = require('./lib/createFeature');
const createModal = require('./lib/createModal');

const Store = module.exports = function (ctx) {
    this.data = {};
    this.ctx = ctx;
};

Store.prototype.add = function(feature) {
    this.data[feature.id] = feature;
}    

Store.prototype.remove = function(featureID) {
    this.data[featureID].destroy();
    delete this.data[featureID];
}

Store.prototype.removeAll = function() {
    for (var i in this.data) {
        this.data[i].destroy();
        delete this.data[i];
    }
}

Store.prototype.getByID = function(id) {
    for (i in this.data) {
        if (i == id) {
            return this.data[i]
        }
    }
}

Store.prototype.getAllLayers = function() {
    var layers = [];
    for (i in this.data) {
        var tmpLayers = this.data[i].getLayerIDs();
        for (var j in tmpLayers) {
            layers.push(tmpLayers[j]);            
        }
    }
    // 公共layer
    for (i in Style) {
        layers.push(Style[i].id);
    }
    return layers;
}

Store.prototype.toJsons = function() {
    var saveJsons = [];
    for (i in this.data) {
        var ss = this.data[i].save();
        saveJsons.push(ss);
    }
    return saveJsons;
}

Store.prototype.fromJsons = function(jsons) {
    this.removeAll();
    for (var i in jsons) {
        var feature = createFeature(jsons[i].type, this.ctx);
        feature.load(jsons[i]);
        this.add(feature);
    }
}   

Store.prototype.save = function() {
    var saveJsons = this.toJsons();

    var content = JSON.stringify(saveJsons);
    var blob = new Blob([content], {type:"text/plain;charset=utf-8"});
    var bloburl = URL.createObjectURL(blob);
    var save_link = document.createElement('a');
    save_link.href = bloburl;
    save_link.download = 'draw.json';
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click',true,false,window,0,0,0,0,0,false,false,false,false,0,null);
    save_link.dispatchEvent(event);
    // URL.revokeObjectURL(url);
}

Store.prototype.load = function() {
    const Store = this;
    var modal = createModal('loadModal', '打开绘图文件');
    const btn = modal.firstElementChild.firstElementChild.lastElementChild.lastElementChild;
    var modalbody = modal.firstElementChild.firstElementChild.children[1];

    // modalbody.innerHTML = '<input class="form-control" id="trackFile" type="file" onchange="readFile(this.files)"/>'
    var input = document.createElement('input');
    input.className = 'form-control';
    input.id = 'loadFile';
    input.type = 'file';
    input.onchange = function(event) {
        var files = this.files;
        if (files.length) {
            var file = files[0];
            var reader = new FileReader();
            if (/json+/.test(file.type)) {
                reader.onload = function() {
                    var jsons = JSON.parse(this.result);
                    Store.fromJsons(jsons);
                    document.body.removeChild(modal);
                }
                reader.readAsText(file);
            }
            else {
                alert("请打开一个文本文件");
            }
        }
    }
    modalbody.appendChild(input);
}