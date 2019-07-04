'use strict'

var lup = require('ndarray-lup-factorization'),
    pool = require('ndarray-scratch'),
    ndt = require('ndarray-tests'),
    ndarray = require('ndarray'),
    assert = require('assert'),
    show = require('ndarray-show'),
    lupSolve = require('../lib')


describe('lup-solve with U !== L',function() {

  var A, L, U, LU, P, work, bExp, n

  beforeEach(function() {

    n = 4

    // The example from p.157 of Trefethen and Bau's Numerical Linear Algebra:
    A = ndarray([2,1,1,0, 4,3,3,1, 8,7,9,5, 6,7,9,8], [n,n])
    L = pool.zeros([n,n])
    U = pool.zeros([n,n])
    P = new Array(n)
    bExp = ndarray([2,5,4,3])

    work = pool.zeros([n])
  })

  afterEach(function() {
    pool.free(work)
    pool.free(L)
    pool.free(U)
    pool.free(bExp)
  })

  it('solves Ax=b',function() {
    var x = ndarray([13,38,102,107])

    lup(A, L, P)
    lupSolve( L, A, P, x, work )

    assert( ndt.approximatelyEqual( bExp, x, 1e-8), 'answer is correct' )

    pool.free(work)
  })

  it('solves Ax=b twice, reusing the factorization',function() {
    var x = ndarray([13,38,102,107])
    var y = ndarray([13,38,102,107])

    lup(A, L, P)

    lupSolve( L, A, P, x, work )
    lupSolve( L, A, P, y, work )

    assert( ndt.approximatelyEqual( bExp, x, 1e-8), 'first answer is correct' )
    assert( ndt.approximatelyEqual( bExp, y, 1e-8), 'second answer is correct' )

    pool.free(work)
  })

  it('solves Ax=b and allocates own work vector if required',function() {
    var x = ndarray([13,38,102,107])

    lup(A, L, P)
    lupSolve( L, A, P, x )

    assert( ndt.approximatelyEqual( bExp, x, 1e-8), 'answer is correct' )
  })
})

describe('lup-solve with U === L',function() {

  var A, L, U, P, work, bExp, n

  beforeEach(function() {

    n = 4

    // The example from p.157 of Trefethen and Bau's Numerical Linear Algebra:
    A = ndarray([2,1,1,0, 4,3,3,1, 8,7,9,5, 6,7,9,8], [n,n])
    L = pool.zeros([n,n])
    U = pool.zeros([n,n])
    P = new Array(n)
    bExp = ndarray([2,5,4,3])

    work = pool.zeros([n])
  })

  afterEach(function() {
    pool.free(work)
    pool.free(L)
    pool.free(U)
    pool.free(bExp)
  })

  it('solves Ax=b',function() {
    var x = ndarray([13,38,102,107])

    lup(A, A, P)
    lupSolve( A, A, P, x, work )

    assert( ndt.approximatelyEqual( bExp, x, 1e-8), 'answer is correct' )

    pool.free(work)
  })

  it('solves Ax=b twice, reusing the factorization',function() {
    var x = ndarray([13,38,102,107])
    var y = ndarray([13,38,102,107])

    lup(A, A, P)

    lupSolve( A, A, P, x, work )
    lupSolve( A, A, P, y, work )

    assert( ndt.approximatelyEqual( bExp, x, 1e-8), 'first answer is correct' )
    assert( ndt.approximatelyEqual( bExp, y, 1e-8), 'second answer is correct' )

    pool.free(work)
  })

  it('solves Ax=b and allocates own work vector if required',function() {
    var x = ndarray([13,38,102,107])

    lup(A, A, P)
    lupSolve( A, A, P, x )

    assert( ndt.approximatelyEqual( bExp, x, 1e-8), 'answer is correct' )
  })
})

