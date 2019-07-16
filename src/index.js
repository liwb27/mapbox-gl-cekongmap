const StyleSwitcherControl = require('./styleswitcher');
const MapDrawControl = require('./mapdraw');
const MessageControl = require('./message');

module.exports.Create = function Create(container_id, defaultStyle, stylelist) {
    var map = new mapboxgl.Map({
        container: container_id,
        style: defaultStyle,
        center: [100, 40],
        zoomControl: true,
        zoom: 5,
        attributionControl: false
    });

    var scale = new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'metric'
    });
    map.addControl(scale);

    var fullScreen = new mapboxgl.FullscreenControl();
    map.addControl(fullScreen)

    var nav = new mapboxgl.NavigationControl();
    map.addControl(nav);

    map.addControl(new StyleSwitcherControl(stylelist));

    map.addControl(new MapDrawControl());

    map.addControl(new MessageControl());

    return map;
}

module.exports.MapDrawControl = MapDrawControl;
module.exports.StyleSwitcherControl = StyleSwitcherControl;