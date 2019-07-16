require('./styles.css')
const ui = require('./ui')
const events = require('./events')
const Store = require('./store')
const svgloader = require('./svgloader')
const Style = require('./features/style');

const ctx = {};

class MapDrawControl {
    constructor(options) {
        ctx.options = options || MapDrawControl.DEFAULT_OPTIONS;
        ctx.geojson_draw = {
            'type':'FeatureCollection',
            'features': []
        };
    }

    getDefaultPosition() {
        const defaultPosition = "top-left";
        return defaultPosition;
    }
    connect() {
        // ctx.map.off('load', this.connect);
        // clearInterval(this.mapLoadedInterval);
        // setup.addLayers();
        // ctx.store.storeMapConfig();
        ctx.events.addEventListeners();
        if (ctx.map.getSource('geojson_draw') == null) {
            ctx.map.addSource('geojson_draw', {
                'type':'geojson',
                'data': ctx.geojson_draw
            });
        }
        // 提前添加所有active显示用图层
        for (var i in Style) {
            if (ctx.map.getLayer(Style[i].id) == null) {
                ctx.map.addLayer(Style[i]);
            }
        }
    }
    onAdd(map) {
        if (process.env.NODE_ENV !== 'test') {
            // Monkey patch to resolve breaking change to `fire` introduced by
            // mapbox-gl-js. See mapbox/mapbox-gl-draw/issues/766.
            const _fire = map.fire;
            map.fire = function (type, event) {
                let args = arguments;

                if (_fire.length === 1 && arguments.length !== 1) {
                    args = [xtend({}, {
                        type: type
                    }, event)];
                }
                return _fire.apply(map, args);
            };
        }

        ctx.map = map;
        ctx.svgs = svgloader(map);
        ctx.events = events(ctx);
        ctx.ui = ui(ctx);
        ctx.container = map.getContainer();
        ctx.store = new Store(ctx);
        this.controlContainer = ctx.ui.addButtons(); //添加按钮

        // 禁用框选放大功能
        if (ctx.options.boxSelect) {
            map.boxZoom.disable();
            // Need to toggle dragPan on and off or else first
            // dragPan disable attempt in simple_select doesn't work
            map.dragPan.disable();
            map.dragPan.enable();
        }

        map.on('load', this.connect);
        map.on('style.load', function() {
            if (ctx.map.getSource('geojson_draw') == null) {
                ctx.map.addSource('geojson_draw', {
                    'type':'geojson',
                    'data': ctx.geojson_draw
                });
            }
            // 提前添加所有active显示用图层
            for (var i in Style) {
                if (ctx.map.getLayer(Style[i].id) == null) {
                    ctx.map.addLayer(Style[i]);
                }
            }
            var jsons = ctx.store.toJsons();
            ctx.store.fromJsons(jsons);
        });

        // if (map.loaded()) {
        //     this.connect();
        // } else {
        //     map.on('load', this.connect);
        //     this.mapLoadedInterval = setInterval(() => {
        //         if (map.loaded()) {
        //             this.connect();                    
        //         }
        //     }, 16);
        // }

        ctx.events.start();

        return this.controlContainer;
    }

    onRemove() {
        // Stop connect attempt in the event that control is removed before map is loaded
        ctx.map.off('load', this.connect);
        clearInterval(this.mapLoadedInterval);

        // setup.removeLayers();
        // ctx.store.restoreMapConfig();
        // ctx.ui.removeButtons();
        // ctx.events.removeEventListeners();
        // ctx.ui.clearMapClasses();
        // ctx.map = null;
        // ctx.container = null;
        // ctx.store = null;

        if (this.controlContainer && this.controlContainer.parentNode) this.controlContainer.parentNode.removeChild(this.controlContainer);
        this.controlContainer = null;

        return this;

    }
}

MapDrawControl.DEFAULT_OPTIONS = {
    textControl: null, // 文字显示控件
    controls: { //启用的按钮
        'point': true,
        'line': true,
        'rect': true,
        'polygon': true,
        'round': true,
        'sector': true,
        'coordinate': false, // 取消该功能
        'distance': true,
        'trash': true,
        'combine_features': false,
        'uncombine_features': false,
        'text':true,
        'edit': true,
        'save': true,
        'load': true,
    },

    // defaultMode: Constants.modes.SIMPLE_SELECT,
    keybindings: true,
    // touchEnabled: true,
    clickBuffer: 2,
    touchBuffer: 25,
    boxSelect: true,
    displayControlsDefault: true,
    // styles: require('./lib/theme'),
    modes: require('./modes'),
    userProperties: false
};

module.exports = MapDrawControl;
module.exports.ctx = ctx;//调试用
