var solve = require('../');
var show = require('ndarray-show');
var crout = require('ndarray-crout-decomposition');
var ndarray = require('ndarray');
var zeros = require('zeros');

var A = ndarray(
    [ 2, 1, -1, 8, -3, -1, 2, -11, -2, 1, 2, -3 ],
    [ 4, 3 ], [ 1, 4 ]
);
var LU = zeros([ 3, 3 ]);
crout(A.hi(3,3), LU);

var solution = solve(LU, A.lo(3,0).pick(0));

console.log('input:\n' + show(A), '\n');
console.log('solution:\n' + show(solution));
