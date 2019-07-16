const Point = require('../features/point');

const DrawPoint = {};

DrawPoint.name = 'draw_point';

DrawPoint.start = function () {
};

DrawPoint.stop = function () {
    //模式结束时的收尾工作
    this.point = null;
};

DrawPoint.setOption = function (modeOptions) {
    
};


DrawPoint.trash = function () {

};
DrawPoint.showCoord = function () {
};

DrawPoint.measure = function () {
};
DrawPoint.edit = function () {
};
DrawPoint.combineFeatures = function () {
};

DrawPoint.uncombineFeatures = function () {
};

DrawPoint.mousedown = function () {
};

DrawPoint.mouseup = function () {
};

DrawPoint.keydown = function (event) {
};

DrawPoint.keyup = function (event) {
    if (event.keyCode === 27) {//esc
        this.stop();
        this.ctx.events.changeMode('simple_select');        
    }
};

DrawPoint.mousemove = function (state) {
};

DrawPoint.mouseout = function (state) {
};

DrawPoint.click = function (state, e) {
    if (state.originalEvent.button == 0){
        var point = new Point(DrawPoint.ctx);
        point.setCoordinate([state.lngLat.lng, state.lngLat.lat]);
        this.ctx.store.add(point);
        this.point = point;
    }
};
module.exports = DrawPoint;