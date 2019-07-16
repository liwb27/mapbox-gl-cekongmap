const xtend = require('xtend');
const Constants = require('./constants');

const classTypes = ['mode', 'feature', 'mouse'];

module.exports = function (ctx) {
    const buttonElements = {};
    let activeButton = null;

    let currentMapClasses = {
        mode: null, // e.g. mode-direct_select
        feature: null, // e.g. feature-vertex
        mouse: null // e.g. mouse-move
    };

    let nextMapClasses = {
        mode: null,
        feature: null,
        mouse: null
    };

    function clearMapClasses() {
        queueMapClasses({
            mode: null,
            feature: null,
            mouse: null
        });
        updateMapClasses();
    }

    function queueMapClasses(options) {
        nextMapClasses = xtend(nextMapClasses, options);
    }

    function updateMapClasses() {
        if (!ctx.container) return;

        const classesToRemove = [];
        const classesToAdd = [];

        classTypes.forEach((type) => {
            if (nextMapClasses[type] === currentMapClasses[type]) return;

            classesToRemove.push(`${type}-${currentMapClasses[type]}`);
            if (nextMapClasses[type] !== null) {
                classesToAdd.push(`${type}-${nextMapClasses[type]}`);
            }
        });

        if (classesToRemove.length > 0) {
            ctx.container.classList.remove.apply(ctx.container.classList, classesToRemove);
        }

        if (classesToAdd.length > 0) {
            ctx.container.classList.add.apply(ctx.container.classList, classesToAdd);
        }

        currentMapClasses = xtend(currentMapClasses, nextMapClasses);
    }

    function createControlButton(id, options = {}) {
        // 根据输入参数，创建按钮
        const button = document.createElement('button');
        button.className = `${Constants.classes.CONTROL_BUTTON} ${options.className}`;
        button.setAttribute('title', options.title);
        options.container.appendChild(button);

        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const clickedButton = e.target;
            if (clickedButton === activeButton) {
                deactivateButtons();
                ctx.events.changeMode(Constants.modes.SIMPLE_SELECT) // 返回普通模式
                return;
            }

            setActiveButton(id);
            options.onActivate();
        }, true);

        return button;
    }

    function addButtons() {
        const controls = ctx.options.controls;
        const controlGroup = document.createElement('div');  
        controlGroup.className = `${Constants.classes.CONTROL_GROUP} ${Constants.classes.CONTROL_BASE}`;

        if (!controls) return controlGroup;

        if (controls[Constants.controls.POINT]) {
            buttonElements[Constants.controls.POINT] = createControlButton(Constants.controls.POINT, {
                container: controlGroup,
                className: Constants.classes.CONTROL_BUTTON_POINT,
                title: `绘制点`,
                onActivate: () => ctx.events.changeMode(Constants.modes.DRAW_POINT)
            });
        }

        if (controls[Constants.controls.LINE]) {
            buttonElements[Constants.controls.LINE] = createControlButton(Constants.controls.LINE, {
                container: controlGroup,
                className: Constants.classes.CONTROL_BUTTON_LINE,
                title: `绘制直线`,
                onActivate: () => ctx.events.changeMode(Constants.modes.DRAW_LINE)
            });
        }

        if (controls[Constants.controls.RECT]) {
            buttonElements[Constants.controls.RECT] = createControlButton(Constants.controls.RECT, {
                container: controlGroup,
                className: Constants.classes.CONTROL_BUTTON_RECT,
                title: `绘制矩形`,
                onActivate: () => ctx.events.changeMode(Constants.modes.DRAW_RECT)
            });
        }

        if (controls[Constants.controls.POLYGON]) {
            buttonElements[Constants.controls.POLYGON] = createControlButton(Constants.controls.POLYGON, {
                container: controlGroup,
                className: Constants.classes.CONTROL_BUTTON_POLYGON,
                title: `绘制多边形`,
                onActivate: () => ctx.events.changeMode(Constants.modes.DRAW_POLYGON)
            });
        }

        if (controls[Constants.controls.ROUND]) {
            buttonElements[Constants.controls.ROUND] = createControlButton(Constants.controls.ROUND, {
                container: controlGroup,
                className: Constants.classes.CONTROL_BUTTON_ROUND,
                title: `绘制圆形`,
                onActivate: () => ctx.events.changeMode(Constants.modes.DRAW_ROUND)
            });
        }

        if (controls[Constants.controls.SECTOR]) {
            buttonElements[Constants.controls.SECTOR] = createControlButton(Constants.controls.SECTOR, {
                container: controlGroup,
                className: Constants.classes.CONTROL_BUTTON_SECTOR,
                title: `绘制扇形`,
                onActivate: () => ctx.events.changeMode(Constants.modes.DRAW_SECTOR)
            });
        }

        if (controls[Constants.controls.TEXT]) {
            buttonElements[Constants.controls.TEXT] = createControlButton(Constants.controls.TEXT, {
                container: controlGroup,
                className: Constants.classes.CONTROL_BUTTON_TEXT,
                title: `绘制文字`,
                onActivate: () => ctx.events.changeMode(Constants.modes.DRAW_TEXT)
            });
        }

        const controlGroup2 = document.createElement('div');
        controlGroup2.className = `${Constants.classes.CONTROL_GROUP} ${Constants.classes.CONTROL_BASE}`;
        
        if (controls[Constants.controls.COORDINATE]) {
            buttonElements[Constants.controls.COORDINATE] = createControlButton(Constants.controls.COORDINATE, {
                container: controlGroup2,
                className: Constants.classes.CONTROL_BUTTON_COORDINATE,
                title: `坐标`,
                onActivate: () => ctx.events.showCoord()
            });
        }

        if (controls[Constants.controls.DISTANCE]) {
            buttonElements[Constants.controls.DISTANCE] = createControlButton(Constants.controls.DISTANCE, {
                container: controlGroup2,
                className: Constants.classes.CONTROL_BUTTON_DISTANCE,
                title: `测量`,
                onActivate: () => ctx.events.measure()
            });
        }
        if (controls[Constants.controls.EDIT]) {
            buttonElements[Constants.controls.EDIT] = createControlButton(Constants.controls.EDIT, {
                container: controlGroup2,
                className: Constants.classes.CONTROL_BUTTON_EDIT,
                title: `编辑`,
                onActivate: () => {
                    ctx.events.edit();
                }
            });
        }

        if (controls.combine_features) {
            buttonElements.combine_features = createControlButton('combineFeatures', {
                container: controlGroup2,
                className: Constants.classes.CONTROL_BUTTON_COMBINE_FEATURES,
                title: 'Combine',
                onActivate: () => {
                    ctx.events.combineFeatures();
                }
            });
        }

        if (controls.uncombine_features) {
            buttonElements.uncombine_features = createControlButton('uncombineFeatures', {
                container: controlGroup2,
                className: Constants.classes.CONTROL_BUTTON_UNCOMBINE_FEATURES,
                title: 'Uncombine',
                onActivate: () => {
                    ctx.events.uncombineFeatures();
                }
            });
        }

        if (controls.trash) {
            buttonElements.trash = createControlButton('trash', {
                container: controlGroup2,
                className: Constants.classes.CONTROL_BUTTON_TRASH,
                title: '删除',
                onActivate: () => {
                    ctx.events.trash();
                }
            });
        }

        const controlGroup3 = document.createElement('div');
        controlGroup3.className = `${Constants.classes.CONTROL_GROUP} ${Constants.classes.CONTROL_BASE}`;
        
        if (controls[Constants.controls.SAVE]) {
            buttonElements[Constants.controls.SAVE] = createControlButton(Constants.controls.SAVE, {
                container: controlGroup3,
                className: Constants.classes.CONTROL_BUTTON_SAVE,
                title: `保存`,
                onActivate: () => {
                    ctx.store.save();
                }
            });
        }

        if (controls[Constants.controls.LOAD]) {
            buttonElements[Constants.controls.LOAD] = createControlButton(Constants.controls.LOAD, {
                container: controlGroup3,
                className: Constants.classes.CONTROL_BUTTON_LOAD,
                title: `读取`,
                onActivate: () => {
                    ctx.store.load();
                }
            });
        }

        var div = document.createElement('div');
        div.appendChild(controlGroup);
        div.appendChild(controlGroup2);
        div.appendChild(controlGroup3);
        return div;
    }

    function removeButtons() {
        Object.keys(buttonElements).forEach(buttonId => {
            const button = buttonElements[buttonId];
            if (button.parentNode) {
                button.parentNode.removeChild(button);
            }
            delete buttonElements[buttonId];
        });
    }

    function deactivateButtons() {
        if (!activeButton) return;
        activeButton.classList.remove(Constants.classes.ACTIVE_BUTTON);
        activeButton = null;
    }

    function setActiveButton(id) {
        deactivateButtons();

        const button = buttonElements[id];
        if (!button) return;

        if (button && id !== 'trash' && id !== 'distance' && id !== 'save' && id !== 'load' && id !== 'edit') { //删除按钮没有激活状态
            button.classList.add(Constants.classes.ACTIVE_BUTTON);
            activeButton = button;
        }
    }

    return {
        setActiveButton,
        addButtons,
        removeButtons,
        queueMapClasses,
        updateMapClasses,
        clearMapClasses,
    };
}