class Model {
    constructor(minVal = 5, maxVal = 40, step = 5, defaultVal = 10, isSquare = true) {
        // this.script = document.currentScript;
        this.controller = new Controller(minVal, maxVal, step, defaultVal);

        // const SCALE = new Slider('Scale', 5, 40, 5, 10, 'SCALE');
        // this.renderer = new CellRenderer(SCALE.value);
        // this.addControl(SCALE);

        // const xScale = new Slider('X Scale', 5, 40, 5, 10, 'X_SCALE');
        // const yScale = new Slider('Y Scale', 5, 40, 5, 10, 'Y_SCALE');
        // const matchScale = new Checkbox('1:1 scale ratio', false, 'MATCH_SCALE');

        // this.addControl(xScale);
        // this.addControl(yScale);
        // this.addControl(matchScale);

        const rectScale = new RectScale(minVal, maxVal, step, defaultVal, isSquare = true);
        this.renderer = new CellRenderer();
        this.addControl(rectScale);
    }

    /**
     * Adds a control to the controller
     * Control ID cannot be SCALE or DRAW
     * @param {Control} control the control input object to be added
     */
    addControl(control) {
        this.controller.addControl(control);

        control.exportControls().forEach(id => {
            // model adds listener so it can lead responses
            const elt = document.getElementById(id);
            elt.addEventListener('input', this.handleInput.bind(this));
        })

        this.renderer.update(control.id, control.getValue());
    }

    /**
     * Passes the event on to the controller and updates the renderer
     * @param {Event} event event to be handled
     */
    handleInput(event) {
        const rendererKey = event.target.closest('.m-control--container').id;
        // returns updated value
        const update = this.controller.handleInput(event);
        // send that to the renderer
        this.renderer.update(rendererKey, update);
    }

    draw() {
        this.renderer.draw()
    }

    setPrep(func) {
        this.renderer.setPrep(func);
    }
    
    setDraw(func) {
        this.renderer.update('DRAW', func);
    }
}

/**
 * The methods necessary to render each cell
 */
 class CellRenderer {
    constructor(xDim, yDim = xDim) {
        this.data = {}

        this.data.SCALE = {
            'x': xDim,
            'y': yDim
        }
        this.data.WIDTH = width;
        this.data.HEIGHT = height;

        this.data.DRAW = (x, y) => { 
            const square = max(abs(x), abs(y));
            
            fill(255 - square * 255);
            rect(0, 0, square);
        }

        this.prep = this._defaultPrep;
    }

    /**
     * define a custom set of styling presets
     * @param {Function} func styling methods
     */
    setPrep(func) {
        this.prep = func;
    }

    /**
     * the default styling
     */
    _defaultPrep() {
        noStroke();
        rectMode(CENTER);
        ellipseMode(CENTER);
    }

    /**
     * update the value of a data entry
     * @param {String} id data id
     * @param {*} value new value
     */
    update(id, value) {
        this.data[id] = value;
    }

    /**
     * The main function that draws each cell to the canvas
     * @param {Function} func the function used to draw the graphic within each cell
     */
    draw() {
        // prep data
        const X_SCALE = this.data.SCALE.x;
        const Y_SCALE = this.data.SCALE.y;
        const HEIGHT = this.data.HEIGHT;
        const WIDTH = this.data.WIDTH;
        const DRAW = this.data.DRAW;

        for (let y = 0; y < Y_SCALE; y++) {
            for (let x = 0; x < X_SCALE; x++) {
                push();

                // prepare styling
                this.prep();
                // position canvas
                translate(
                    map(x + 0.5, 0, X_SCALE, 0, WIDTH),
                    map(y + 0.5, 0, Y_SCALE, 0, HEIGHT)
                    );
                // scale to 1x1 area
                scale(WIDTH/X_SCALE, HEIGHT/Y_SCALE);

                // draw ✨
                DRAW(
                    map(x + 0.5, 0, X_SCALE, -1, 1), // x scaled to -1, 1 range
                    map(y + 0.5, 0, Y_SCALE, -1, 1), // y scaled to -1, 1 range
                    this.data
                );

                pop();
            }
        }
    }
}

class Controller {
    constructor() {
        this.controls = {};

        this.html = `
            <div class="m-control-panel"></div>
        `;

        script.parentElement.insertAdjacentHTML('beforeend', this.html);
    }

    /**
     * Add control object to the controller
     * @param {Control} control 
     */
    addControl(control) {
        this.controls[control.id] = control;

        const panel = document.getElementsByClassName('m-control-panel')[0];
        panel.insertAdjacentHTML('beforeend', control.html);
    }

    /**
     * Passes the event on to the control and passes back the updated value
     * @param {Event} event
     * @returns updated value
     */
    handleInput(event) {
        const control = event.target.closest('.m-control--container').id;
        // pass event and get (potentially) new value
        const updatedValue = this.controls[control].handleInput(event);

        // pass value back to the model
        return updatedValue;
    }


}

class Control {
    /**
     * Creates a new Control object and the necessary html
     * @param {String} name HTML display text
     * @param {*} value default value
     * @param {String} id Element id (recommended)
     */
    constructor(name, value, id = undefined) {
        this.name = name;
        this.value = value;
        this.inputs = {};

        // default to name if no id is provided
        if (id === undefined) {
            this.id = name;
            warn("ID defaulted to display name. Unexpected behavior may occur.");
        } else {
            this.id = id;
        }
    }

    /**
     * Helper function to create HTML element
     * (is expected to be overwritten)
     */
    _createHTML() {
        return this.html = `
            <div id="${this.id}" class="m-control--container m-generic">
                <div class="m-control--label">${this.name}</div>
                <div class="m-control--input">
                    <input name="${this.name}" value="${this.value}"/>
                </div>
                <div class="m-control--display">${this.value}</div>
            </div>
        `;
    }

    /**
     * Returns a list of ids corresponding to controls to be used
     * (Must be overwritten)
     * @returns ids
     */
    exportControls() {
        throw "dawg please overwrite this :SCcrying:";
    }

    /**
     * Returns the current value of the control
     * (Must be overwritten)
     * @returns current value
     */
    getValue() {
        throw "this is a abstract class yo"
    }

    /**
     * Updates control and passes back updated value
     * (Must be overwritten)
     * @returns updated value
     */
    handleInput() {
        throw "this shit ain't set up right"
    };
}

class RectScale extends Control {
    /**
     * Creates a new Slider object and the necessary html
     * @param {Number} min slider minimum value
     * @param {Number} max slider maximum value
     * @param {Number} step slider step value
     * @param {Number} value default value
     * @param {Number} isSquare link x and y scales by default
     */
    constructor(min, max, step, value, isSquare = true) {
        // sets values
        super('Scale', value, 'SCALE');

        this.min = min;
        this.max = max;
        this.step = step;

        // create html
        this.html = this._createHTML();
    }

    exportControls() {
        return ['RECT_SCALE_X', 'RECT_SCALE_Y', '_RECT_SCALE_BOX'];
    }

    /**
     * Helper function to create HTML element
     * (Overwrites parent method)
     */
    _createHTML() {
        let ret = `
            <div id="${this.id}" class="m-control--container m-rect-scale">
        `;
        // x scale
        ret += this._createScaleSlider('x scale', 'RECT_SCALE_X');
        // y scale
        ret += this._createScaleSlider('y scale', 'RECT_SCALE_Y');
        // checkbox
        ret += this._createCheckbox('same x and y scale', '_RECT_SCALE_BOX');
        return ret + `</div>`;
    }

    _createScaleSlider(name, id) {
        return `
            <div id="${id}" class="m-subcontrol">
                <div class="m-subcontrol--label">${name}</div>
                <div class="m-subcontrol--input">
                    <input type="range" min="${this.min}" max="${this.max}" step="${this.step}">
                </div>
                <div class="m-subcontrol--display">${this.value}</div>
            </div>
        `;
    }

    _createCheckbox(name, id) {
        return `
            <div id="${id}" class="m-subcontrol">
                <div class="m-subcontrol--label">${name}</div>
                <div class="m-subcontrol--input">
                    <input type="checkbox" checked>
                </div>
                <div class="m-subcontrol--display"></div>
            </div>
        `;
    }

    getValue() {
        const x = document.getElementById('RECT_SCALE_X');
        const y = document.getElementById('RECT_SCALE_Y');
        
        return {
            'x': x.getElementsByTagName('input')[0].value,
            'y': y.getElementsByTagName('input')[0].value
        }
    }

    /**
     * Updates control and passes back updated value
     * (Overwrites parent method)
     * @returns updated value
     */
    handleInput(event) {
        // process checkbox
        const eltCheckbox = document.getElementById('_RECT_SCALE_BOX').getElementsByTagName('input')[0];
        const eltScaleX = document.getElementById('RECT_SCALE_X').getElementsByTagName('input')[0];
        const eltScaleY = document.getElementById('RECT_SCALE_Y').getElementsByTagName('input')[0];

        if(eltCheckbox.checked === true) {
            const changed = event.target.closest('.m-subcontrol').id;
            if (changed === 'RECT_SCALE_Y') {
                eltScaleX.value = eltScaleY.value;
            } else {
                eltScaleY.value = eltScaleX.value;
            }
        }

        // update display
        const eltScaleXDisplay = document.getElementById('RECT_SCALE_X').getElementsByClassName('m-subcontrol--display')[0];
        const eltScaleYDisplay = document.getElementById('RECT_SCALE_Y').getElementsByClassName('m-subcontrol--display')[0];

        eltScaleXDisplay.innerHTML = eltScaleX.value;
        eltScaleYDisplay.innerHTML = eltScaleY.value;

        // pass value back to conroller
        return {
            'x': eltScaleX.value,
            'y': eltScaleY.value,
        }
    };
}

class Slider extends Control {
    /**
     * Creates a new Slider object and the necessary html
     * @param {String} name HTML display text
     * @param {Number} min slider minimum value
     * @param {Number} max slider maximum value
     * @param {Number} step slider step value
     * @param {Number} value default value
     * @param {String} id Element id (recommended)
     */
    constructor(name, min, max, step, value, id = undefined) {
        // sets values
        super(name, value, id);

        this.min = min;
        this.max = max;
        this.step = step;

        // create html
        this.html = this._createHTML();
    }

    /**
     * Helper function to create HTML element
     * (Overwrites parent method)
     */
    _createHTML() {
        return this.html = `
            <div id="${this.id}" class="m-control--container m-slider">
                <div class="m-control--label">${this.name}</div>
                <div class="m-control--input">
                    <input type="range" min="${this.min}" max="${this.max}" step="${this.step}">
                </div>
                <div class="m-control--display">${this.value}</div>
            </div>
        `;
    }

    getValue() {
        const elt = document.getElementById(this.id);
        return elt.getElementsByTagName('input')[0].value;
    }

    exportControls() {
        return [this.id];
    }

    /**
     * Updates control and passes back updated value
     * (Overwrites parent method)
     * @returns updated value
     */
    handleInput() {
        const elt = document.getElementById(this.id);
        const value = elt.getElementsByTagName('input')[0].value;

        // update display
        const display = elt.getElementsByClassName('m-control--display')[0];
        display.innerText = value;

        return value; // pass value back to conroller
    };
}

class Checkbox extends Control {
    /**
     * Creates a new Control object and the necessary html
     * @param {String} name HTML display text
     * @param {*} value default value
     * @param {String} id Element id (recommended)
     */
    constructor(name, value, id = undefined) {
        // sets values
        super(name, value, id);

        // create html
        this.html = this._createHTML();
    }



    /**
     * Helper function to create HTML element
     * (is expected to be overwritten)
     */
    _createHTML() {
        return this.html = `
            <div id="${this.id}" class="m-control--container m-slider">
                <div class="m-control--label">${this.name}</div>
                <div class="m-control--input">
                    <input type="checkbox" ${this.value ? 'checked' : ''}>
                </div>
                <div class="m-control--display"></div>
            </div>
        `;
    }

    getValue() {
        const elt = document.getElementById(this.id);
        return elt.getElementsByTagName('input')[0].value;
    }

    exportControls() {
        return [this.id];
    }

    /**
     * Updates control and passes back updated value
     * (Must be overwritten)
     * @returns updated value
     */
    handleInput() {
        const elt = document.getElementById(this.id);
        const value = elt.getElementsByTagName('input')[0].value;

        return value; // pass value back to conroller
    };
}
