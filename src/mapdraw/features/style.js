const style = {};
style.line = {
    'id': 'line-active',
    'source': 'geojson_draw',
    'type': 'line',
    'filter': [
        'all', 
        ['==', '$type', 'LineString'],
        ['==', 'active', 'true']
    ],
    'layout': {
        'line-cap': 'round',
        'line-join': 'round'
    },
    'paint': {
        'line-color': '#fbb03b',
        'line-dasharray': [0.2, 2],
        'line-width': 2
    }
};

style.point_stroke = {
    'id': 'point-stroke-active',
    'source': 'geojson_draw',    
    'type': 'circle',
    'filter': [
        'all', 
        ['==', '$type', 'Point'],
        ['==', 'active', 'true'],
        ['!=', 'meta', 'midpoint'],
        ['in', 'meta:type', 'point', 'vertex'],
    ],
    'paint': {
        'circle-radius': 7,
        'circle-color': '#fff'
    }
};

style.point = {
    'id': 'point-active',
    'source': 'geojson_draw',
    'type': 'circle',
    'filter': [
        'all', 
        ['==', '$type', 'Point'],
        ['!=', 'meta', 'midpoint'],
        ['in', 'meta:type', 'point', 'vertex'],
        ['==', 'active', 'true']
    ],
    'paint': {
        'circle-radius': 5,
        'circle-color': '#fbb03b'
    }
};

style.polygon_fill =
{
    'id': 'polygon-fill-active',
    'source': 'geojson_draw',    
    'type': 'fill',
    'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    'paint': {
        'fill-color': '#fbb03b',
        'fill-outline-color': '#fbb03b',
        'fill-opacity': 0.1
    }
};

style.polygon_stroke = {
    'id': 'polygon-stroke-active',
    'source': 'geojson_draw',    
    'type': 'line',
    'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    'layout': {
        'line-cap': 'round',
        'line-join': 'round'
    },
    'paint': {
        'line-color': '#fbb03b',
        'line-dasharray': [0.2, 2],
        'line-width': 2
    }
};

style.text = {
    'id': 'text-active',
    'source': 'geojson_draw',    
    'type': 'symbol',
    'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Point'], ['==', 'meta:type', 'text']],
    'layout': {
        'text-field': "{title}",
        'text-font': ['Noto Sans Italic'],
        'text-offset': [0, -0.5],
        'text-anchor': "top",
        'text-size': 24,
        'text-allow-overlap': true,
    },
    'paint': {
        'text-color': '#ff0000',
    }
};

module.exports = style;