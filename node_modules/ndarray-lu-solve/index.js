var ndarray = require('ndarray');
var ndscratch = require('ndarray-scratch');

module.exports = function (L, U, B, X, Y) {
    var m = L.shape[0], n = L.shape[1], freeY = false;
    if (U.dimension === 1) {
        Y = X;
        X = B;
        B = U;
        U = L;
    }
    if (!X) X = ndscratch.malloc([m]);
    if (!Y) {
        Y = ndscratch.malloc([m]);
        freeY = true
    }
    
    // LY = B, solve for Y
    for (var y = 0; y < n; y++) {
        var c = 0;
        for (var x = 0; x < y; x++) {
            c += L.get(x, y) * Y.get(x);
        }
        Y.set(y, (B.get(y) - c) / L.get(y, y));
    }
    
    //UX = Y, solve for X
    for (var y = n - 1; y >= 0; y--) {
        var c = 0;
        for (var x = n - 1; x > y; x--) {
            c += U.get(x, y) * X.get(x);
        }
        X.set(y, Y.get(y) - c);
    }
    
    if (freeY) ndscratch.free(Y);
    
    return X;
};
