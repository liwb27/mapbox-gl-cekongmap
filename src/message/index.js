require('./styles.css');

class MessageControl {
    constructor() {
    }

    getDefaultPosition() {
        const defaultPosition = "bottom-right";
        return defaultPosition;
    }
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'cekongmessage-container';
        this._container.id = 'message-container2';
        var lbl = document.createElement('label');
        lbl.textContent = '';
        this.label = lbl;
        this._container.appendChild(lbl);
        this._map.on('mousemove', (e) => {
            $.ajax({
                url: "http://1.1.11.227/api/chinaalt",
                type: "Get",
                data: {
                    'lng': e.lngLat.lng,
                    'lat': e.lngLat.lat
                },
            }).success(function (data) {
                lbl.textContent = [e.lngLat.lng.toFixed(6),e.lngLat.lat.toFixed(6),data];
            });
            // lbl.textContent = [e.lngLat.lng.toFixed(6),e.lngLat.lat.toFixed(6)];
        });
        
        return this._container;    
    }
    onRemove() {
        this._map.off('mousemove', this.mouseMove);
        return;
    }
    mouseMove(e) {
    }
}

module.exports = MessageControl;