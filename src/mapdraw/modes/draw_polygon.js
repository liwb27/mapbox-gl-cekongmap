const Polygon = require('../features/polygon');

const DrawPolygon = {};

DrawPolygon.name = 'draw_polygon';
DrawPolygon.stage = 'stage0';

DrawPolygon.start = function () {
};

DrawPolygon.stop = function () {
    //模式结束时的收尾工作
    this.stage = 'stage0';
    if (this.poly != null) {
        this.poly.deactivate();
        this.ctx.store.add(this.poly);        
        this.poly = null;
    }
};

DrawPolygon.setOption = function (modeOptions) {

};

DrawPolygon.trash = function () {
    this.stage = 'stage0';    
    if (this.poly != null) {
        this.poly.destroy();// 移除
        this.poly = null;
    }
};
DrawPolygon.showCoord = function () {
};
DrawPolygon.measure = function () {
};
DrawPolygon.edit = function () {
};
DrawPolygon.combineFeatures = function () {};

DrawPolygon.uncombineFeatures = function () {};

DrawPolygon.mousedown = function () {};

DrawPolygon.mouseup = function () {};

DrawPolygon.keydown = function (event) {
};

DrawPolygon.keyup = function (event) {
    if (event.keyCode === 13) {//enter
        this.stop();
        this.ctx.events.changeMode('simple_select');        
    }
    else if (event.keyCode === 27) {//esc
        // if (this.stage == 'stage1') {
        //     const lastCoord = this.poly.coordinates.length - 2;
        //     this.poly.removeCoordinate(lastCoord);
        //     this.stop();        
        // }
        this.trash();
        this.ctx.events.changeMode('simple_select');
    }
}    

DrawPolygon.mousemove = function (state) {
    if(this.stage == 'stage1') {
        const lastCoord = this.poly.coordinates.length - 2;//修改倒数第二点
        this.poly.updateCoordinate(lastCoord, state.lngLat.lng, state.lngLat.lat);
    }
};

DrawPolygon.mouseout = function (state) {};

DrawPolygon.click = function (state) {
    if (state.originalEvent.button == 2) {//右键单击
        if (this.stage == 'stage1') {
            if (this.poly.coordinates.length <= 4) {
                this.poly.destroy();
            }
            else {
                const lastCoord = this.poly.coordinates.length - 2;
                this.poly.removeCoordinate(lastCoord);
            }
            this.stop();
        }
    }
    else {
        if (this.stage == 'stage0') {
            const poly = new Polygon(this.ctx);
            // this.ctx.store.add(poly);
            this.poly = poly;
            const lastCoord = poly.coordinates.length;
            poly.addCoordinate(lastCoord, state.lngLat.lng, state.lngLat.lat);// 起始点
            poly.addCoordinate(lastCoord, state.lngLat.lng, state.lngLat.lat);// 第一点
            poly.addCoordinate(lastCoord, state.lngLat.lng, state.lngLat.lat);// 终点与起始点相同
            this.stage = 'stage1';
        }
        else if (this.stage == 'stage1') {
            const lastCoord = this.poly.coordinates.length - 1;// 在倒数第1点后插入
            this.poly.addCoordinate(lastCoord, state.lngLat.lng, state.lngLat.lat);
        }
    }

};

module.exports = DrawPolygon;