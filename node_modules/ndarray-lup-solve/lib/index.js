'use strict'

var blas = require('ndarray-blas-level1'),
    pool = require('ndarray-scratch')

function solve( L, U, P, x, work ) {

  var allocWork = work === undefined

  var i, Uii
  var dot = blas.dot;

  if( L.dimension !== 2 ||  L.shape[0] !== L.shape[1] ) {
    throw new Error('ndarray-lup-solve:: L must be a square, two-dimensional ndarray')
  }
  var n = L.shape[0]

  if( U.dimension !== 2 ||  U.shape[0] !== U.shape[1] ) {
    throw new Error('ndarray-lup-solve:: U must be a square, two-dimensional ndarray')
  }
  if( U!==L && U.shape[0] !== n ) {
    throw new Error('ndarray-lup-solve:: shape of L must be the same as U')
  }
  if( P.length !== n ) {
    throw new Error('ndarray-lup-solve:: P must be an Array with length matching the dimensions of L and U')
  }
  if( x.shape[0] !== n ) {
    throw new Error('ndarray-lup-solve:: x must be an ndarray with length matching the dimensions of L and U')
  }
  if( work && work.shape[0] !== n ) {
    throw new Error('ndarray-lup-solve:: if provided, work vector must be an ndarray with length matching the dimensions of L and U')
  }


  if( allocWork) {
    work = pool.malloc([n])
  }

  // TODO: This shouldn't have to happen, should it? Is it possible to implicitly just make this correct without manually
  // permuting the entries? If this step is skipped, the input must be permuted and the result ends up permuted, which is
  // just unfriendly.
  for(i=0; i<n; i++) {
    work.set(i, x.get(P[i]))
  }
  blas.copy(work,x)

  // Step 1: solve y = L^-1 * z via forward substitution (note that it's somewhat
  // simpler than regular forward substitution since, by definition, the diagonal
  // of L is all 1's
  for(i=1; i<n; i++) {
    x.set(i, (x.get(i) - dot(L.pick(i,null).hi(i), x.hi(i))) )
  }

  // Step 2: solve x = U^-1 * y via back subsititution
  x.set( n-1, x.get(n-1)/U.get(n-1,n-1) )
  for(i=n-2; i>=0; i--) {
    Uii = U.get(i,i)
    if( Uii===0 ) return false;
    x.set(i, (x.get(i) - dot(U.pick(i,null).lo(i+1), x.lo(i+1))) / Uii )
  }

  if( allocWork ) {
    pool.free(work)
  }

  return true;
}



module.exports = solve
