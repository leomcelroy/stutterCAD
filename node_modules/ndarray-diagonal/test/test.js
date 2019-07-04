'use strict'

var diag = require('../diag')

var pack = require('ndarray-pack')
var tape = require('tape')

tape('1D', function(t) {
  var M = pack([1, 2, 3, 4])
  var D = diag(M)

  t.equals(D.shape[0], 4)

  t.equals(M.get(0), D.get(0))
  t.equals(M.get(1), D.get(1))
  t.equals(M.get(2), D.get(2))
  t.equals(M.get(3), D.get(3))

  D.set(1, 100)

  t.equals(D.get(1), 100)
  t.equals(M.get(0), D.get(0))
  t.equals(M.get(1), D.get(1))
  t.equals(M.get(2), D.get(2))
  t.equals(M.get(3), D.get(3))

  t.end()
})

tape('2D', function(t) {
  var M = pack([[1, 2, 3], 
                [4, 5, 6],
                [7, 8, 9]])
  var D = diag(M)
  
  t.equals(D.shape[0], 3)

  t.equals(M.get(0,0), D.get(0))
  t.equals(M.get(1,1), D.get(1))
  t.equals(M.get(2,2), D.get(2))

  D.set(1, 100)

  t.equals(D.get(1), 100)
  t.equals(M.get(0,0), D.get(0))
  t.equals(M.get(1,1), D.get(1))
  t.equals(M.get(2,2), D.get(2))

  t.end()
})

tape('3D', function(t) {
  var M = pack([[[1, 2], 
                 [3, 4]],
                [[5, 6], 
                 [7, 8]]])
  var D = diag(M)

  t.equals(D.shape[0], 2)

  t.equals(M.get(0,0,0), D.get(0))
  t.equals(M.get(1,1,1), D.get(1))
  
  D.set(1, 100)

  t.equals(D.get(1), 100)

  t.equals(M.get(0,0,0), D.get(0))
  t.equals(M.get(1,1,1), D.get(1))
  
  t.end()
})