'use strict'

var ndarray = require('ndarray')

module.exports = pickDiagonal

function pickDiagonal(M) {
  var d = M.dimension
  if(d <= 1) {
    return M
  }
  var nshape  = (1<<30)
  var nstride = 0
  var mshape  = M.shape
  var mstride = M.stride
  for(var i=0; i<d; ++i) {
    nshape   = Math.min(nshape, mshape[i])|0
    nstride += mstride[i]
  }
  return ndarray(M.data, [nshape], [nstride], M.offset)
}