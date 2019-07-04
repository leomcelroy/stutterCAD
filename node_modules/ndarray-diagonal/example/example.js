var pack = require('ndarray-pack')
var diagonal = require('../diag')
var show = require('ndarray-show')

var M = pack([[1, 0, 2],
              [2, 3, 1],
              [4, 5, 0]])

var diag = diagonal(M)


console.log('diag=', show(diag))

//diag is actually a view of the entries of M

diag.set(2,  100000)  //Update the 3rd diagonal entry
console.log('M=', show(M))