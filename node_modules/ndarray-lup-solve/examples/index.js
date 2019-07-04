var lup = require('ndarray-lup-factorization'),
    solve = require('../'),
    ndarray = require('ndarray'),
    pool = require('ndarray-scratch')

var A = ndarray([2,1,1,0, 4,3,3,1, 8,7,9,5, 6,7,9,8], [4,4])
var b = ndarray([13,38,102,107])
var P = []

// In-place LUP factorization:
lup(A, A, P)
solve( A, A, P, b)

console.log('b = ',b)

// b now contains the answer x: [2,5,4,3]
// A and P are unchanged and can be re-used
