const Round = require('../features/round');
const Turf = require('@turf/turf');

const DrawRound = {};

DrawRound.name = 'draw_round';
DrawRound.stage = 'stage0';

DrawRound.start = function () {
};

DrawRound.stop = function () {
    //模式结束时的收尾工作
    this.stage = 'stage0';
    if (this.round != null) {
        if (this.round.coordinates.length != 0) {
            this.round.deactivate();
            this.ctx.store.add(this.round);        
        }
        else {
            this.round.destroy();
        }
        this.round = null;        
    }
};

DrawRound.setOption = function (modeOptions) {
};

DrawRound.trash = function () {
    this.stage = 'stage0';    
    if (this.round != null) {
        this.round.destroy();// 移除
        this.round = null;
    }
};

DrawRound.showCoord = function () {
};

DrawRound.measure = function () {
};
DrawRound.edit = function () {
};
DrawRound.combineFeatures = function () {};

DrawRound.uncombineFeatures = function () {};

DrawRound.mousedown = function () {};

DrawRound.mouseup = function () {};

DrawRound.keydown = function (event) {
};

DrawRound.keyup = function (event) {
    if (event.keyCode === 13) {//enter
        this.stop();
        this.ctx.events.changeMode('simple_select');
    }
    else if (event.keyCode === 27) {//esc
        if (this.stage == 'stage1') {
            this.trash();
        }
        this.ctx.events.changeMode('simple_select');
    }
}

DrawRound.mousemove = function (state) {
    if(this.stage == 'stage1') {
        this.round.makeRoundWithCoord(state.lngLat.lng, state.lngLat.lat);
    }
};

DrawRound.mouseout = function (state) {};

DrawRound.click = function (state) {
    if (state.originalEvent.button == 2) {//右键单击
    }
    else {
        if (this.stage == 'stage0') {
            const round = new Round(this.ctx);
            this.round = round;
            this.round.setCenter(state.lngLat.lng, state.lngLat.lat);
            this.stage = 'stage1';
        }
        else if (this.stage == 'stage1') {
            this.stop();
        }
    }

};

module.exports = DrawRound;