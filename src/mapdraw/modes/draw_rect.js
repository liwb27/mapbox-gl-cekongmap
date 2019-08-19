const Rect = require('../features/rect');
const Turf = require('@turf/turf');

const DrawRect = {};

DrawRect.name = 'draw_rect';
DrawRect.stage = 'stage0';

DrawRect.start = function () {
};

DrawRect.stop = function () {
    //模式结束时的收尾工作
    this.stage = 'stage0';
    if (this.rect != null) {
        this.rect.deactivate();
        this.ctx.store.add(this.rect);        
        this.rect = null;
        this.bearing1 = undefined;
        this.bearing2 = undefined;
    }
};

DrawRect.setOption = function (modeOptions) {

};

DrawRect.trash = function () {
    this.stage = 'stage0';    
    if (this.rect != null) {
        this.rect.destroy();// 移除
        this.rect = null;
    }
};
DrawRect.showCoord = function () {
};

DrawRect.measure = function () {
};
DrawRect.edit = function () {
};
DrawRect.combineFeatures = function () {};

DrawRect.uncombineFeatures = function () {};

DrawRect.mousedown = function () {};

DrawRect.mouseup = function () {};

DrawRect.keydown = function (event) {
};

DrawRect.keyup = function (event) {
    if (event.keyCode === 13) {//enter
        if (this.stage == 'stage1' || this.stage == 'stage2') {
            this.stop();
        }
        this.ctx.events.changeMode('simple_select');
    }
    else if (event.keyCode === 27) {//esc
        // if (this.stage == 'stage1' || this.stage == 'stage2') {
        //     this.rect.destroy();
        // }
        // this.stop();
        this.trash();
        this.ctx.events.changeMode('simple_select');
    }
}    

DrawRect.mousemove = function (state) {
    if (this.stage == 'stage1') {
        top_left = this.rect.getCoordinate(0);
        this.rect.updateCoordinate(1, state.lngLat.lng, top_left[1]);
        this.rect.updateCoordinate(2, state.lngLat.lng, state.lngLat.lat);
        this.rect.updateCoordinate(3, top_left[0], state.lngLat.lat);
        // 记录初始旋转角度
        this.bearing1 = Turf.bearing(top_left, [state.lngLat.lng, state.lngLat.lat]);
    }
    else if (this.stage == 'stage2') {
        top_left = this.rect.getCoordinate(0);
        this.bearing2 = Turf.bearing(top_left, [state.lngLat.lng, state.lngLat.lat]);
        rotate_degree = this.bearing2 - this.bearing1;//计算旋转角度
        this.bearing1 = this.bearing2;//更新初始角度
        this.rect.rotate(rotate_degree);
    }

};

DrawRect.mouseout = function (state) {};

DrawRect.click = function (state) {
    if (state.originalEvent.button == 2) {//右键单击
        if(this.stage == 'stage1') {
            this.rect.destroy();
            this.rect = null;
            this.bearing1 = undefined;
            this.bearing2 = undefined;
            this.stop();
        }
        else if (this.stage == 'stage2') {
            this.stage = 'stage1';
        }
    }
    else {
        if (this.stage == 'stage0') {
            const rect = new Rect(this.ctx);
            // this.ctx.store.add(rect);
            this.rect = rect;
            const lastCoord = rect.coordinates.length;
            rect.addCoordinate(lastCoord, state.lngLat.lng, state.lngLat.lat);
            rect.addCoordinate(lastCoord, state.lngLat.lng, state.lngLat.lat);
            rect.addCoordinate(lastCoord, state.lngLat.lng, state.lngLat.lat);
            rect.addCoordinate(lastCoord, state.lngLat.lng, state.lngLat.lat);
            rect.addCoordinate(lastCoord, state.lngLat.lng, state.lngLat.lat);
            this.stage = 'stage1';
        }
        else if (this.stage == 'stage1') {
            this.stage = 'stage2';
        }
        else if (this.stage == 'stage2') {
            this.stop();
        }   
    }

};

module.exports = DrawRect;
