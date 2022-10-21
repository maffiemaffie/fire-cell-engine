class Noise {
    constructor(dim, depth) {
        this.dim = dim; // n dimension in Rn space
        this.pow = depth; // resolution power
        this.res = 1 << depth; // tile size

        this.merp = new Merp(dim); // interpolator
        this.values = this._init(); // randomize lattice points
    }

    /**
     * Randomize lattice points
     * @returns an Array of randomized values
     */
    _init() {
        let ret = [];
        // tile size ^ dimension
        for (let i = 0; i < 1 << this.pow * this.dim; i++) {
            ret.push(Math.random());
        }
        return ret;
    }

    /**
     * Gets the 2^n lattice points surrounding a given point
     * @param  {...Number} coords x0, x1, ..., xn coordinates of a given point
     * @returns {Number[]} the surrounding points
     */
    _getBounds(...coords) {
        let axes = [];
        for(let i = 0; i < this.dim; i++) {
            axes.push([Math.floor(coords[i]), Math.floor(coords[i]) + 1]);
        }

        let points = [];
        // construct each point (run through every combination of 2n axes)
        for (let vert = 0; vert < 1 << this.dim; vert++) {
            const pointCoords = getBits(vert, this.dim);

            const point = [];
            pointCoords.forEach((bit, i) => {
                point.push(axes[i][bit]); // [x0, x1, ..., xn axis][each side]
            });

            points.push(point);
        }

        return points;
    }

    /**
     * Gets the interpolated value at a given point
     * @param  {...Number} coords x0, x1, ..., xn coordinates of a given point
     * @returns {Number} the value
     */
    get(...coords) {
        const mask = _fill(this.pow);
        let points = this._getBounds(...coords); // boundary points
        let dists = coords.map((p, i) => p - points[0][i]); // d0, d1, ..., dn distances
        dists = dists.map(d => this._mapDecimal(this._smooth(d), -1, 1)); // smoothstep, map [-1, 1]

        let values = points.map(p => p.map(c => c & mask)); // modulo point
        values = values.map(p => this._getPoint(...p)); // get value at point

        return this.merp.merp({'values': values, 'distances': dists});
    }

    /**
     * Gets the interpolated gradient at a given point
     * @param  {...Number} coords x0, x1, ..., xn coordinates of a given point
     * @returns {Number[]} x0, x1, ..., xn gradient vector
     */
    gradient(...coords) {
        const scalar = 30 / (1 << this.dim);
        let points = this._getBounds(...coords); // boundary points
        let dists = coords.map((p, i) => p - points[0][i]); // D0, D1, ..., Dn distances
        
        let values = points.map(p => p.map(c => c & mask)); // modulo point
        values = values.map(p => this._getPoint(...p)); // get value at point

        
    }

    /**
     * Returns the value at a given lattice point
     * @param  {...Number} coords x0, x1, ..., xn coordinates of a given point
     * @returns {Number} the lattice value
     */
    _getPoint(...coords) {
        return this.values[this._toIndex(...coords)];
    }

    /**
     * Flattens the n coordinates to a 1D index coordinate
     * @param  {...Number} coords x0, x1, ..., xn coordinates of a given point
     * @returns {Number} the index
     */
    _toIndex(...coords) {
        // FUCK YOU RECURSION WRAPPERS I HATE YOU I HATE YOU I HATE YOU
        const _toIndexRecurse = (n, ...coords) => {
            if (coords.length === 0) return 0;
            return (coords[0] << n) + _toIndexRecurse(n + this.pow, ...(coords.slice(1)));
        }
        // but alas, i have to use you 😔
        return _toIndexRecurse(0, ...coords);
    }

    /**
     * Converts an index coordinate into coordinates in Rn
     * @param {Number} index the 1D index coordinate
     * @returns {Number[]} [x0, x1, ..., xn] n dimensional coordinates
     */
    _toCoords(index) {
        const mask = _fill(this.pow);
        let ret = [];
        for (let i = 0; i < this.dim; i++, index >>= this.pow) ret.push(index & mask);
        return ret;
    }

    /**
     * Remaps a value to a specified range, from [0, 1]
     * @param {Number} value value to be mapped [0, 1]
     * @param {Number} toMin new minimum
     * @param {Number} toMax new maximum
     * @returns {Number} value mapped to new range
     */
    _mapDecimal(value, toMin, toMax) {
        return value * toMax + (1 - value) * toMin;
    }

    /**
     * Smooths a value on [0, 1]
     * @param {Number} x value to be smoothed [0, 1]
     * @returns {Number} the smoothed value
     */
    _smooth(x) {
        // lol 6x^5 -15x^4 + 10x^3
        return x * x * x * (10 + x * (-15 + 6 * x));
    }


}

class OctaveNoise {
    constructor(dim, depth, detail) {
        let octaves = [];
        for (let i = 0; i < detail; i++) {
            octaves.push(new Noise(dim, depth));
        }
        this.octaves = octaves;
    }

    get(...coords) {
        let sum = this.octaves.reduce((total, octave, i) => {
            const thisCoords = coords.map(c => c * (1 << i));
            return total + (this.octaves.length - i) * (this.octaves.length - i) * octave.get(...thisCoords)[0];
        }, 0);

        const n = this.octaves.length;
        sum /= n * (n + 1) * (2 * n + 1) / 6;

        return sum;
    }
}