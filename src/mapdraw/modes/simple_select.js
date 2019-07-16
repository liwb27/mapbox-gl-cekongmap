const Constants = require('../constants');
const mouseEventPoint = require('../lib/mouse_event_point');
const featuresAt = require('../lib/features_at');
const createModal = require('../lib/createModal');

const SimpleSelect = {};

SimpleSelect.name = 'simple_select';

SimpleSelect.select = [];
SimpleSelect.boxSelectElement = null;

SimpleSelect.start = function () {
};

SimpleSelect.stop = function () {
    //模式结束时的收尾工作

};

SimpleSelect.stopExtendedInteractions = function (state) {
    if (this.boxSelectElement) {
        if (this.boxSelectElement.parentNode) this.boxSelectElement.parentNode.removeChild(this.boxSelectElement);
        this.boxSelectElement = null;
    }

    this.ctx.map.dragPan.enable();

    this.boxSelecting = false;
    this.canBoxSelect = false;
    this.dragMoving = false;
    this.canDragMove = false;
};

SimpleSelect.setOption = function (modeOptions) {
};


SimpleSelect.trash = function () {
    if (this.select.length != 0) { //有之前选中目标
        for(i in this.select) {
            this.ctx.store.remove(this.select[i])
        }
    }            
    this.select = [];
};

SimpleSelect.showCoord = function () {
    // if (this.select.length != 0) {
    //     var t = '';
    //     for (i in this.select) {

    //         t += this.ctx.store.getByID(this.select[i]).getCoordInfo();
    //     }
    //     var c = confirm(t);
    // }
};

SimpleSelect.measure = function () {
    if (this.select.length != 0) {
        const modal = createModal('infoModal');
        const modalbody = modal.firstElementChild.firstElementChild.firstElementChild;
        for (i in this.select) {
            var tmpDiv = this.ctx.store.getByID(this.select[i]).getInfo();
            modalbody.appendChild(tmpDiv);
        }
    }
};

SimpleSelect.edit = function () {
    if (this.select.length != 0) {
        this.ctx.store.getByID(this.select[0]).getEditModal();
    }
};

SimpleSelect.combineFeatures = function () {
};

SimpleSelect.uncombineFeatures = function () {
};

SimpleSelect.mousedown = function (state, e) {
    if (state.featureTarget != undefined) {//本次click选择的目标
        // Stop any already-underway extended interactions
        this.stopExtendedInteractions(state);
    
        // Disable map.dragPan immediately so it can't start
        this.ctx.map.dragPan.disable();
    
        // Re-render it and enable drag move
        // this.doRender(e.featureTarget.properties.id);
    
        // Set up the state for drag moving
        this.canDragMove = true;
        this.dragMoveLocation = state.lngLat;
    }
    else if (state.originalEvent.shiftKey == true) {
        // start boxselect
        this.stopExtendedInteractions(state);
        this.ctx.map.dragPan.disable();
        // Enable box select
        this.boxSelectStartLocation = mouseEventPoint(state.originalEvent, this.ctx.map.getContainer());
        this.canBoxSelect = true;
        this.ctx.ui.queueMapClasses({ mouse: Constants.cursors.ADD });
        this.ctx.ui.updateMapClasses();        
        return;
    }
};

SimpleSelect.mouseup = function (state) {
    // End any extended interactions
    if (this.dragMoving) {
        // this.fireUpdate();
    } else if (this.boxSelecting) {//todo
        const bbox = [
            this.boxSelectStartLocation,
            mouseEventPoint(state.originalEvent, this.ctx.map.getContainer())
        ];
        const featuresInBox = featuresAt.click(null, bbox, this.ctx);

        if (featuresInBox.length) {
            var ids = featuresInBox.map(s => s.properties.id)
                .filter(id => id !== undefined)
                .reduce((memo, id) => {
                    memo.add(id);
                    return memo;
                  }, new Set());
            ids = [...ids];

            for (i in ids) {
                var feature = this.ctx.store.getByID(ids[i]);
                if (feature == undefined) continue;
                if (!feature.isActive()) {
                    feature.activate();
                    this.select.push(feature.id);
                }
            }
            this.ctx.ui.queueMapClasses({ mouse: Constants.cursors.MOVE });
            this.ctx.ui.updateMapClasses();
        }
    }
    this.stopExtendedInteractions(state);
};

SimpleSelect.keydown = function (event) {
};

SimpleSelect.keyup = function (event) {
    if (event.keyCode === 27) {//esc
        //todo 取消boxselect
        this.stopExtendedInteractions();
        // 取消选择  
        if (this.select.length != 0) { //有之前选中目标
            for(i in this.select) {
                var feature = this.ctx.store.getByID(this.select[i]);
                if (feature == undefined) continue;
                feature.deactivate(); //清除acitve
            }
        }
        this.select = []; //清除之前选择目标      
    }
};

SimpleSelect.mousemove = function (state) {
    return this.stopExtendedInteractions(state);
};

SimpleSelect.mouseout = function (state) {
    //todu 取消boxselect
};

SimpleSelect.click = function (state, e) {
    if (state.originalEvent.shiftKey == true) {
        //按下shift
        if (state.featureTarget != undefined) {
            var feature = this.ctx.store.getByID(state.featureTarget.properties.id);
            if (feature == undefined) return;
            if (feature.isActive()) {
                feature.deactivate();
                this.ctx.ui.queueMapClasses({ mouse: Constants.cursors.POINTER });
                this.ctx.ui.updateMapClasses();
                for (var i in this.select) {
                    if (feature.id == this.select[i]) {
                        this.select.splice(i,1);
                        break;
                    }
                }
            }
            else {
                feature.activate();
                this.ctx.ui.queueMapClasses({ mouse: Constants.cursors.MOVE });
                this.ctx.ui.updateMapClasses();
                this.select.push(state.featureTarget.properties.id);
            }
            this.canDragMove = true;// 允许拖拽移动选中的feature            
        }
    }       
    else {
        if (this.select.length != 0) { //有之前选中目标
            for(i in this.select) {
                var feature = this.ctx.store.getByID(this.select[i]);
                if (feature == undefined) continue;
                feature.deactivate(); //清除acitve
            }
        }
        this.select = []; //清除之前选择目标
        if (state.featureTarget != undefined) {//本次click选择的目标
            var feature = this.ctx.store.getByID(state.featureTarget.properties.id);
            if (feature == undefined) return;
            feature.activate();
            this.select.push(state.featureTarget.properties.id);
            this.ctx.ui.queueMapClasses({ mouse: Constants.cursors.MOVE });
            this.ctx.ui.updateMapClasses();
            this.canDragMove = true;// 允许拖拽移动选中的feature
        }
        else {
            this.canDragMove = false;// 禁止拖拽移动选中的feature            
        }
        if (state.originalEvent.ctrlKey == true) {
            this.edit();
        } 
    }
};

SimpleSelect.drag = function (state, e) {
    if (this.canDragMove) return this.dragMove(state, e);
    if (this.ctx.options.boxSelect && this.canBoxSelect) return this.whileBoxSelect(state, e);
};

SimpleSelect.dragMove = function (state, e) {
    // Dragging when drag move is enabled
    this.dragMoving = true;

    const delta = {
        lng: state.lngLat.lng - this.dragMoveLocation.lng,
        lat: state.lngLat.lat - this.dragMoveLocation.lat
    };

    // moveFeatures
    for (i in this.select) {
        var feature = this.ctx.store.getByID(this.select[i]);
        if (feature == undefined) continue;
        feature.move(delta);
    }
    
    this.dragMoveLocation = state.lngLat;
};

SimpleSelect.whileBoxSelect = function (state, e) {
    this.boxSelecting = true;

    // Create the box node if it doesn't exist
    if (!this.boxSelectElement) {
        this.boxSelectElement = document.createElement('div');
        this.boxSelectElement.classList.add(Constants.classes.BOX_SELECT);
        this.ctx.map.getContainer().appendChild(this.boxSelectElement);
    }

    // Adjust the box node's width and xy position
    const current = mouseEventPoint(state.originalEvent, this.ctx.map.getContainer());
    const minX = Math.min(this.boxSelectStartLocation.x, current.x);
    const maxX = Math.max(this.boxSelectStartLocation.x, current.x);
    const minY = Math.min(this.boxSelectStartLocation.y, current.y);
    const maxY = Math.max(this.boxSelectStartLocation.y, current.y);
    const translateValue = `translate(${minX}px, ${minY}px)`;
    this.boxSelectElement.style.transform = translateValue;
    this.boxSelectElement.style.WebkitTransform = translateValue;
    this.boxSelectElement.style.width = `${maxX - minX}px`;
    this.boxSelectElement.style.height = `${maxY - minY}px`;

    this.ctx.ui.queueMapClasses({ mouse: Constants.cursors.ADD });
    this.ctx.ui.updateMapClasses();

};

module.exports = SimpleSelect;