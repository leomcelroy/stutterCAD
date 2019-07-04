'use strict'

var blas = require('ndarray-blas-level1'),
    ops = require('ndarray-ops'),
    diagonal = require('ndarray-diagonal')

function factorize ( A, L, P ) {
  var i,j,k, Ljk, Uk, Ukk, m=A.shape[1], tmp

  var m = A.shape[0]
  var n = A.shape[1]

  if( m !== n ) {
    // TODO: standardize this exception reporting
    throw new Error('LUP Decomposition::factorize():: Input matrix A must be square')
  }

  var separate = A!==L

  if( separate ) {
    ops.assigns(diagonal(L),1)
  }

  for(i=0;i<m;i++) { P[i] = i }

  for(k=0; k<m; k++) {
    i = blas.iamax(A.pick(null,k).lo(k).hi(m-k))+k

    Uk = A.pick(k,null)
    blas.swap( Uk.lo(k).hi(m-k), A.pick(i,null).lo(k).hi(m-k) )
    if( k > 0 ) {
      blas.swap( L.pick(k,null).hi(k), L.pick(i,null).hi(k) )
    }

    tmp=P[i], P[i]=P[k], P[k]=tmp

    Ukk = A.get(k,k)

    if( Ukk===0 ) {
      return false;
    }

    for(j=k+1; j<m; j++) {
      Ljk = A.get(j,k)/Ukk
      blas.axpy(-Ljk, Uk.lo(k+1).hi(m-k-1), A.pick(j,null).lo(k+1).hi(m-k-1))
      L.set(j,k,Ljk)
    }

    if( separate ) {
      ops.assigns(A.pick(null,k).lo(k+1).hi(m-k-1),0)
    }
  }
  return true
}

module.exports = factorize




/*
function lupWithoutSwap ( A, L, U, P ) {
  var i,j,k, m=A.shape[1], U=A, tmp
  var Ljk, Uk, Ukk
  var umax, imax,tmp;

  // Handle factorize( A, LU, P ):
  if( U && !P ) {
    P = U
    U = L
    L = A
  }

  for(i=0;i<m;i++) { P[i] = i }

  for(k=0; k<m; k++) {

    for(imax=k,umax=-Infinity,i=k;i<m;i++) {
      if( (tmp=Math.abs(A.get(P[i],k))) > umax ) {
        umax = tmp, imax=i
      }
    }
    i = imax

    Uk = U.pick(k,null)

    blas.swap( L.pick(k,null).hi(k), L.pick(i,null).hi(k) )

    tmp=P[i], P[i]=P[k], P[k]=tmp

    Ukk = A.get(P[k],k)

    if( Ukk===0 ) {
      return false
    }

    for(j=k+1; j<m; j++) {

      Ljk = U.get(P[j],k)/Ukk

      L.set(j,k,Ljk)

      blas.axpy(-Ljk, U.pick(P[k],null).lo(k).hi(m-k), U.pick(P[j],null).lo(k).hi(m-k))

    }
  }

  return true;
}*/
