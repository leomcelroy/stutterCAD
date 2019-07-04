# ndarray-lup-solve

[![Build Status](https://travis-ci.org/scijs/ndarray-lup-solve.svg?branch=master)](https://travis-ci.org/scijs/ndarray-lup-solve) [![npm version](https://badge.fury.io/js/ndarray-lup-solve.svg)](http://badge.fury.io/js/ndarray-lup-solve)  [![Dependency Status](https://david-dm.org/scijs/ndarray-lup-solve.svg)](https://david-dm.org/scijs/ndarray-lup-solve)

Solve ndarray Ax=b via LU factorization with pivoting

## Introduction

Given an [LUP factorization](https://www.npmjs.com/package/ndarray-lup-factorization), this module solves for x in Ax = b. More precisely, it solves for x in LUx = Pb.

## Example

```javascript
var lup = require('ndarray-lup-factorization'),
    solve = require('ndarray-lup-solve'),
    ndarray = require('ndarray'),
    pool = require('ndarray-scratch')

var A = ndarray([2,1,1,0, 4,3,3,1, 8,7,9,5, 6,7,9,8], [4,4])
var b = ndarray([13,38,102,107])
var P = []

// In-place LUP factorization:
//   Note: repeated A tells it L and U are both stored in A
lup(A, A, P)
solve( A, A, P, b)

// b now contains the answer x: [2,5,4,3]
// A and P are unchanged and can be re-used to solve another problem
```

## Usage

#### `require('ndarray-lup-solve')( L, U, P, b [, work] )`

- `L`: The n x n ndarray lower-triangular portion of the LUP factorization. The diagonal entries are implicitly assumed to be 1. Unchanged by the algorithm.
- `U`: The n x n ndarray upper-triangular portion of the LUP factorization. Unchanged by the algorithm.
- `P`: An `Array` of length n containg the permutation
- `b`: An ndarray of length n containing the righthand side of Ax = b
- `work`: (optional) A vector used to permute the entries. If not provided, it is allocated and released into an `ndarray-scratch` typed vector pool.

Returns `true` on successful completion; `false` otherwise.

#### `require('ndarray-lup-solve')( LU, LU, P, b [, work] )`

If the first two arguments are identical then it's understood that both L and U are stored in a single matrix with the diagonal entries of L (all unity) omitted. Usage and behavior is otherwise identical.


## Credits
(c) 2015 Ricky Reusser. MIT License
