const Line = require('../features/line');

const DrawLine = {};

DrawLine.name = 'draw_line';
DrawLine.stage = 'stage0';

DrawLine.start = function () {
};

DrawLine.stop = function () {
    //模式结束时的收尾工作
    DrawLine.stage = 'stage0';
    if (this.line != null) {
        DrawLine.line.deactivate();
        this.ctx.store.add(this.line);        
        DrawLine.line = null;
    }
};

DrawLine.setOption = function (modeOptions) {

};

DrawLine.trash = function () {
    this.stage = 'stage0';    
    if (this.line != null) {
        this.line.destroy();// 移除当前线
        this.line = null;
    }
};
DrawLine.showCoord = function () {
};
DrawLine.edit = function () {
};
DrawLine.measure = function () {
};
DrawLine.combineFeatures = function () {};

DrawLine.uncombineFeatures = function () {};

DrawLine.mousedown = function () {};

DrawLine.mouseup = function () {};

DrawLine.keydown = function (event) {

};

DrawLine.keyup = function (event) {
    if (event.keyCode === 13) {//enter
        if (this.stage == 'stage1') {
            this.stop();
        }
        this.ctx.events.changeMode('simple_select');
    }
    else if (event.keyCode === 27) {//esc
        // this.esc();
        this.trash();
        this.ctx.events.changeMode('simple_select');        
    }
}    
DrawLine.esc = function () {
    if (this.stage == 'stage1') {
        const lastCoord = this.line.coordinates.length - 1;
        this.line.removeCoordinate(lastCoord);
        this.stop();
    }
};

DrawLine.mousemove = function (state) {
    if (this.stage == 'stage1') {
        const lastCoord = this.line.coordinates.length - 1;
        this.line.updateCoordinate(lastCoord, state.lngLat.lng, state.lngLat.lat);
    }
};

DrawLine.mouseout = function (state) {};

DrawLine.click = function (state) {
    if (state.originalEvent.button == 2) {//右键单击
        this.esc();
    }
    else if (state.originalEvent.button == 0){
        if (this.stage == 'stage0') {
            var line = new Line(DrawLine.ctx);
            // this.ctx.store.add(line);
            this.line = line;
            const lastCoord = line.coordinates.length;    
            line.addCoordinate(lastCoord, state.lngLat.lng, state.lngLat.lat);
            line.addCoordinate(lastCoord, state.lngLat.lng, state.lngLat.lat);// 多加一点，最后删除

            this.stage = 'stage1';
        }
        else if (this.stage == 'stage1') {
            const lastCoord = this.line.coordinates.length;
            this.line.addCoordinate(lastCoord, state.lngLat.lng, state.lngLat.lat);
        }

    }
};

module.exports = DrawLine;