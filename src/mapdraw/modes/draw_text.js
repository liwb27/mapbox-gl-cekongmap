const Text = require('../features/text');

const DrawText = {};

DrawText.name = 'draw_text';

DrawText.start = function () {
};

DrawText.stop = function () {
    //模式结束时的收尾工作
    this.text = null;
};

DrawText.setOption = function (modeOptions) {
    
};


DrawText.trash = function () {
};

DrawText.showCoord = function () {
};
DrawText.edit = function () {
};
DrawText.measure = function () {
};

DrawText.combineFeatures = function () {
};

DrawText.uncombineFeatures = function () {
};

DrawText.mousedown = function () {
};

DrawText.mouseup = function () {
};

DrawText.keydown = function (event) {
};

DrawText.keyup = function (event) {
    if (event.keyCode === 27) {//esc
        this.stop();
        this.ctx.events.changeMode('simple_select');        
    }
};

DrawText.mousemove = function (state) {
};

DrawText.mouseout = function (state) {
};

DrawText.click = function (state, e) {
    if (state.originalEvent.button == 0){
        var text = new Text(this.ctx);
        text.setCoordinate([state.lngLat.lng, state.lngLat.lat]);
        var t = prompt('输入文本');
        if (t != null) {
            text.setText(t);
            this.text = text;
            this.ctx.store.add(text);
        }
        else {
            text.destroy();
        }

    }
};
module.exports = DrawText;