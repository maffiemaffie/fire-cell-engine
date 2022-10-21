class Merp {
    constructor(dim) {
        const size = 1 << dim;
        const innerValue = 1 / (size);
        this.merpArrayN = [];
        for (let i = 0; i < size; i++) this.merpArrayN[i] = []; // init

        for (let i = 0; i < size; i++) {
            for(let j = 0; j < size; j++) {
                this.merpArrayN[i][j] = _nxor(...getBits(i | ~j, dim)) ? innerValue : -innerValue;
            }
        }
    }

    /**
     * Multilinear interpolation in any integer dimension
     * @param {Number[]} opts.values the values to be interpolated between
     * @param {Number[]} opts.distances the location of the point, relative to its closest boundary points
     * @param {Number[][]} opts.weights (advanced) a pre-specified array of weight columns, replaces opts.distances
     * @returns {Number[]} interpolated result, formatted as a vector
     */
    merp({'values': vertices, 'distances': dists = undefined, 'weights': products = undefined}) {
        const WEIGHT_PRODUCTS = products ?? this._getWeightProducts(...dists);

        const weights = [];
        WEIGHT_PRODUCTS.forEach(col => {
            weights.push(this.merpArrayN.map(row => dot(row, col)));
        })

        ret = [];
        weights.forEach(w => {
            ret.push( dot(w, vertices) );
        });

        return ret;
    }

    /**
     * Generates the weight column used by this.merp()
     * @param  {...any} dists the location of the point, relative to its closest boundary points
     * @returns {Number[][]} weight column
     */
    _getWeightProducts(...dists){
        const _getWeightProductsRecurse = n => {
            if (n === -1) return [1];
            return [
                ..._getWeightProductsRecurse(n - 1),
                ..._getWeightProductsRecurse(n - 1).map(w => dists[n] * w)
            ];
        }
        return [_getWeightProductsRecurse(dists.length - 1)];
    }
    
}