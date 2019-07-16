require('./colorpicker.css')

module.exports = function () {
    var width = 256;

    var wrapper = document.createElement('div');
    wrapper.className = 'colorpicker_wrapper';

    var can = document.createElement('canvas');
    can.id = 'colorpicker_canvas';
    can.className = 'colorpicker_canvas';
    can.width = 300;
    can.height = 280;
    wrapper.appendChild(can);
    var ctx = can.getContext('2d');

    var cur = document.createElement('em');
    cur.id = 'cur';
    wrapper.appendChild(cur);

    // var panel = document.createElement('div');
    // panel.className = 'colorpicker_canvaspanel';
    // wrapper.appendChild(panel);

    var colorShow = document.createElement('div');
    colorShow.id = 'color_show';
    // panel.appendChild(colorShow);
    
    // var label1 = document.createElement('label');
    // label1.textContent = 'rgb';
    // panel.appendChild(label1);
    var rgbValue = document.createElement('input');
    rgbValue.type = "text";
    rgbValue.className = "color_input";
    rgbValue.value = "";
    rgbValue.id = "rgb_value";
    // label1.appendChild(rgbValue);

    // var label2 = document.createElement('label');
    // label2.textContent = 'hex';
    // panel.appendChild(label2);
    var hexValue = document.createElement('input');
    hexValue.type = "text";
    hexValue.className = "color_input";
    hexValue.value = "";
    hexValue.id = "hex_value";
    // label2.appendChild(hexValue);

    function colorBar() {
        var gradientBar = ctx.createLinearGradient(0, 0, 0, width);
        gradientBar.addColorStop(0, '#f00');
        gradientBar.addColorStop(1 / 6, '#f0f');
        gradientBar.addColorStop(2 / 6, '#00f');
        gradientBar.addColorStop(3 / 6, '#0ff');
        gradientBar.addColorStop(4 / 6, '#0f0');
        gradientBar.addColorStop(5 / 6, '#ff0');
        gradientBar.addColorStop(1, '#f00');
    
        ctx.fillStyle = gradientBar;
        ctx.fillRect(0, 0, 20, width);
    }
    
    function rgb2hex(rgb) {
        var aRgb = rgb instanceof Array ? rgb : (rgb.split(',') || [0, 0, 0]);
        var temp;
        return [
            (temp = Number(aRgb[0]).toString(16)).length == 1 ? ('0' + temp) : temp,
            (temp = Number(aRgb[1]).toString(16)).length == 1 ? ('0' + temp) : temp,
            (temp = Number(aRgb[2]).toString(16)).length == 1 ? ('0' + temp) : temp,
        ].join('');
    }
    
    function hex2rgb(hex) {
        if (hex.length == 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        return [
            parseInt(hex[0] + hex[1], 16),
            parseInt(hex[2] + hex[3], 16),
            parseInt(hex[4] + hex[5], 16),
        ].join();
    }
    
    function colorBox(color) {
        // 底色填充，xx到白色
        var gardientBase = ctx.createLinearGradient(30, 0, width + 30, 0);
        gardientBase.addColorStop(1, color);
        gardientBase.addColorStop(0, 'rgba(255,255,255,1');
        ctx.fillStyle = gardientBase;
        ctx.fillRect(30, 0, width, width);
        // 第二次填充，黑色到透明
        var my_gardient1 = ctx.createLinearGradient(0, 0, 0, width);
        my_gardient1.addColorStop(0, 'rgba(0,0,0,0');
        my_gardient1.addColorStop(1, 'rgba(0,0,0,1');
        ctx.fillStyle = my_gardient1;
        ctx.fillRect(30, 0, width, width);
    }
    
    function init() {
        colorBar();
        colorBox('rgb(255,0,0,1)');
        bind();
    }
    
    function bind() {
        can.addEventListener('click', function (e) {
            var ePos = {
                x: e.offsetX || e.layerX,
                y: e.offsetY || e.layerY
            }
            var rgbaStr = '#000';
            if (ePos.x >= 0 && ePos.x < 20 && ePos.y >= 0 && ePos.y < width) {
                //in
                rgbaStr = getRgbaAtPoint(ePos, 'bar');
                colorBox('rgba(' + rgbaStr + ')');
            } else if (ePos.x >= 30 && ePos.x < 30 + width && ePos.y >= 0 && ePos.y < width) {
                rgbaStr = getRgbaAtPoint(ePos, 'box');
            } else {
                return;
            }
            outColor(rgbaStr.slice(0, 3).join());
            cur.style.left = ePos.x + 'px';
            cur.style.top = ePos.y + 'px';
            cur.style.outlineColor = (rgbaStr[0] > 256 / 2 || rgbaStr[1] > 256 / 2 || rgbaStr[2] > 256 / 2) ? '#000' : '#fff';
        });
    }
    
    function outColor(rgb) {
        rgbValue.value = rgb;
        hexValue.value = rgb2hex(rgb);
        colorShow.style.backgroundColor = 'rgb(' + rgb + ')';
    }

    function outColorHex(hex) {
        rgbValue.value = hex2rgb(hex);
        hexValue.value = hex;
        colorShow.style.backgroundColor = 'rgb(' + rgbValue.value + ')';
    }
    
    function getRgbaAtPoint(pos, area) {
        if (area == 'bar') {
            var imgData = ctx.getImageData(0, 0, 20, width);
        } else {
            var imgData = ctx.getImageData(0, 0, can.width, can.height);
        }
        var data = imgData.data;
        var dataIndex = (pos.y * imgData.width + pos.x) * 4;
        return [
            data[dataIndex],
            data[dataIndex + 1],
            data[dataIndex + 2],
            (data[dataIndex + 3] / 255).toFixed(2),
        ];
    }

    init();
    return {
        'colorpicker': wrapper,
        'outColor': colorShow,
        'rgbValue': rgbValue,
        'hexValue': hexValue,
        'setOutColor': outColorHex
    };
}