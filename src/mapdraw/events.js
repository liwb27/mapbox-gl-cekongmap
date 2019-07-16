const getFeaturesAndSetCursor = require('./lib/get_features_and_set_cursor');
const featuresAt = require('./lib/features_at');
const isClick = require('./lib/is_click');
const isTap = require('./lib/is_tap');
const modes = require('./modes');
const Constants = require('./constants');

module.exports = function (ctx) {

    let mouseDownInfo = {};
    let touchStartInfo = {};
    const events = {};
    let currentMode = null;

    for (m in modes) {
        modes[m].ctx = ctx;
    }

    events.drag = function (event, isDrag) {
        if (isDrag({
                point: event.point,
                time: new Date().getTime()
            })) {
            ctx.ui.queueMapClasses({
                mouse: Constants.cursors.DRAG
            });
            currentMode.drag(event);
        } else {
            event.originalEvent.stopPropagation();
        }
    };

    events.mousedrag = function (event) {
        events.drag(event, (endInfo) => !isClick(mouseDownInfo, endInfo));
    };

    events.touchdrag = function (event) {
        events.drag(event, (endInfo) => !isTap(touchStartInfo, endInfo));
    };

    events.mousemove = function (event) {
        const button = event.originalEvent.buttons !== undefined ? event.originalEvent.buttons : event.originalEvent.which;
        if (button === 1) {
            return events.mousedrag(event); //判断为drag
        }
        const target = getFeaturesAndSetCursor(event, ctx); // 得到当前鼠标位置的绘图元素
        event.featureTarget = target;
        currentMode.mousemove(event);
    };

    events.mousedown = function (event) {
        // 当按下alt键时，屏蔽绘图功能
        if (event.originalEvent.altKey == true)
            return;

        mouseDownInfo = {
            time: new Date().getTime(),
            point: event.point
        };
        const target = getFeaturesAndSetCursor(event, ctx);
        event.featureTarget = target;
        currentMode.mousedown(event);
    };

    events.mouseup = function (event) {
        const target = getFeaturesAndSetCursor(event, ctx);
        event.featureTarget = target;

        if (isClick(mouseDownInfo, {
                point: event.point,
                time: new Date().getTime()
            })) {
            currentMode.click(event);
        } else {
            currentMode.mouseup(event);
        }
    };

    events.mouseout = function (event) {
        currentMode.mouseout(event);
    };

    events.touchstart = function (event) {
        // Prevent emulated mouse events because we will fully handle the touch here.
        // This does not stop the touch events from propogating to mapbox though.
        event.originalEvent.preventDefault();
        if (!ctx.options.touchEnabled) {
            return;
        }

        touchStartInfo = {
            time: new Date().getTime(),
            point: event.point
        };
        const target = featuresAt.touch(event, null, ctx)[0];
        event.featureTarget = target;
        currentMode.touchstart(event);
    };

    events.touchmove = function (event) {
        event.originalEvent.preventDefault();
        if (!ctx.options.touchEnabled) {
            return;
        }

        currentMode.touchmove(event);
        return events.touchdrag(event);
    };

    events.touchend = function (event) {
        event.originalEvent.preventDefault();
        if (!ctx.options.touchEnabled) {
            return;
        }

        const target = featuresAt.touch(event, null, ctx)[0];
        event.featureTarget = target;
        if (isTap(touchStartInfo, {
                time: new Date().getTime(),
                point: event.point
            })) {
            currentMode.tap(event);
        } else {
            currentMode.touchend(event);
        }
    };

    // 8 - Backspace
    // 46 - Delete
    const isKeyModeValid = (code) => !(code === 8 || code === 46 || (code >= 48 && code <= 57)); //系统占用的快捷键

    events.keydown = function (event) {
        if ((event.srcElement || event.target).classList[0] !== 'mapboxgl-canvas') return; // we only handle events on the map

        if ((event.keyCode === 8 || event.keyCode === 46) && ctx.options.controls.trash) {
            event.preventDefault();
            currentMode.trash();
        } else if (isKeyModeValid(event.keyCode)) {
            currentMode.keydown(event);
        } else if (event.keyCode === 49 && ctx.options.controls.point) { //1. 点
            changeMode(Constants.modes.DRAW_POINT);
        } else if (event.keyCode === 50 && ctx.options.controls.line) { //2. 线
            changeMode(Constants.modes.DRAW_LINE);
        } else if (event.keyCode === 51 && ctx.options.controls.rect) { //3. 方
            changeMode(Constants.modes.DRAW_RECT);
        } else if (event.keyCode === 52 && ctx.options.controls.polygon) { //4. 多边形
            changeMode(Constants.modes.DRAW_POLYGON);
        } else if (event.keyCode === 53 && ctx.options.controls.round) { //5. 圆
            changeMode(Constants.modes.DRAW_ROUND);
        } else if (event.keyCode === 54 && ctx.options.controls.round) { //6. 扇形
            changeMode(Constants.modes.DRAW_SECTOR);
        } else if (event.keyCode === 57 && ctx.options.controls.coord) { //9. 坐标
            changeMode(Constants.modes.COORDINATE);
        } else if (event.keyCode === 48 && ctx.options.controls.distance) { //0. 测距
            changeMode(Constants.modes.MEASURE_DISTANCE);
        }
    }

    events.keyup = function (event) {
        if (isKeyModeValid(event.keyCode)) {
            currentMode.keyup(event);
        }
    };

    events.data = function (event) {
        // data事件
    };

    events.zoomend = function () {
        ctx.store.changeZoom();
    };

    function changeMode(modename, nextModeOptions, eventOptions = {}) {
        currentMode.stop();
        ctx.ui.setActiveButton(modename);
        currentMode = modes[modename];//切换模式
        ctx.ui.queueMapClasses({ mode: modename });
        ctx.ui.updateMapClasses();
        // currentMode.setOption(nextModeOptions);

    }

    const api = {
        start: function () {
            currentMode = modes.simple_select;
        },
        changeMode,
        currentModeName: function () {
            return currentMode.name;
        },
        getMode: function () {
            return currentMode;
        },

        addEventListeners: function () {
            ctx.map.on('mousemove', events.mousemove);
            ctx.map.on('mousedown', events.mousedown);
            ctx.map.on('mouseup', events.mouseup);
            ctx.map.on('data', events.data);

            ctx.map.on('touchmove', events.touchmove);
            ctx.map.on('touchstart', events.touchstart);
            ctx.map.on('touchend', events.touchend);

            ctx.container.addEventListener('mouseout', events.mouseout);

            if (ctx.options.keybindings) {
                ctx.container.addEventListener('keydown', events.keydown);
                ctx.container.addEventListener('keyup', events.keyup);
            }
        },
        removeEventListeners: function () {
            ctx.map.off('mousemove', events.mousemove);
            ctx.map.off('mousedown', events.mousedown);
            ctx.map.off('mouseup', events.mouseup);
            ctx.map.off('data', events.data);

            ctx.map.off('touchmove', events.touchmove);
            ctx.map.off('touchstart', events.touchstart);
            ctx.map.off('touchend', events.touchend);

            ctx.container.removeEventListener('mouseout', events.mouseout);

            if (ctx.options.keybindings) {
                ctx.container.removeEventListener('keydown', events.keydown);
                ctx.container.removeEventListener('keyup', events.keyup);
            }
        },
        trash: function (options) {
            currentMode.trash(options);
        },
        combineFeatures: function () {
            currentMode.combineFeatures();
        },
        uncombineFeatures: function () {
            currentMode.uncombineFeatures();
        },
        measure: function () {
            currentMode.measure();
        },
        showCoord: function () {
            currentMode.showCoord();
        },
        edit: function () {
            currentMode.edit();
        },
    };

    return api;
}