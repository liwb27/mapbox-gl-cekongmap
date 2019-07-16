const Sector = require('../features/sector');
const Line = require('../features/line');
const Turf = require('@turf/turf');

const DrawSector = {};

DrawSector.name = 'draw_sector';
DrawSector.stage = 'stage0';

DrawSector.start = function () {
};

DrawSector.stop = function () {
    //模式结束时的收尾工作
    this.stage = 'stage0';
    if (this.sector != null) {
        if (this.sector.coordinates.length != 0) {
            this.sector.deactivate();
            this.ctx.store.add(this.sector);        
        }
        else {
            this.sector.destroy();
        }
        this.sector = null;        
    }
    if (this.line != null) {
        this.line.destroy();
        this.line = null;
    }
};

DrawSector.setOption = function (modeOptions) {
};

DrawSector.trash = function () {
    this.stage = 'stage0';    
    if (this.sector != null) {
        this.sector.destroy();// 移除
        this.sector = null;
    }
    if (this.line != null) {
        this.line.destroy();
        this.line = null;
    }
};

DrawSector.showCoord = function () {
};
DrawSector.measure = function () {
};
DrawSector.edit = function () {
};
DrawSector.combineFeatures = function () {};

DrawSector.uncombineFeatures = function () {};

DrawSector.mousedown = function () {};

DrawSector.mouseup = function () {};

DrawSector.keydown = function (event) {
};

DrawSector.keyup = function (event) {
    if (event.keyCode === 13) {//enter
        if (this.stage == 'stage1' || this.stage == 'stage2') {
            this.stop();
        }
        this.ctx.events.changeMode('simple_select');
    }
    else if (event.keyCode === 27) {//esc
        this.trash();
        this.ctx.events.changeMode('simple_select');
    }
}

DrawSector.mousemove = function (state) {
    if(this.stage == 'stage1') {
        const lastCoord = this.line.coordinates.length - 1;
        this.line.updateCoordinate(lastCoord, state.lngLat.lng, state.lngLat.lat);  
    }
    else if (this.stage == 'stage2') {
        // this.sector.bearing2 = Turf.bearing(this.sector.getCenter(), [state.lngLat.lng, state.lngLat.lat]);
        this.sector.setBearing2(state.lngLat.lng, state.lngLat.lat);
        this.sector.makeSector();

        if (this.line != null) {
            this.line.destroy();
            this.line = null;
        }
    }
};

DrawSector.mouseout = function (state) {};

DrawSector.click = function (state) {
    if (state.originalEvent.button == 2) {//右键单击
        
    }
    else {
        if (this.stage == 'stage0') {
            var line = new Line(this.ctx);
            this.line = line;
            const lastCoord = line.coordinates.length;    
            line.addCoordinate(lastCoord, state.lngLat.lng, state.lngLat.lat);
            line.addCoordinate(lastCoord, state.lngLat.lng, state.lngLat.lat);// 多加一点，最后删除
            this.stage = 'stage1';
        }
        else if (this.stage == 'stage1') {
            const sector = new Sector(this.ctx);
            this.sector = sector;
            this.sector.setCenter(this.line.coordinates[0][0], this.line.coordinates[0][1]);
            this.sector.R = Turf.lineDistance(this.line.feature.geometry);
            this.sector.setBearing1(state.lngLat.lng, state.lngLat.lat);
            // this.sector.bearing1 = Turf.bearing(this.sector.getCenter(), [state.lngLat.lng, state.lngLat.lat]);
            this.stage = 'stage2';
        }
        else if (this.stage == 'stage2') {
            this.stop();
        }            
    }

};

module.exports = DrawSector;