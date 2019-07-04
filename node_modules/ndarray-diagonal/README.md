ndarray-diagonal
================
Extract a view of the diagonal entries of an ndarray (no copying necessary!)

# Example

```javascript
var pack = require('ndarray-pack')
var diagonal = require('ndarray-diagonal')
var show = require('ndarray-show')

var M = pack([[1, 0, 2],
              [2, 3, 1],
              [4, 5, 0]])

var diag = diagonal(M)


console.log('diag=\n', show(diag))

//diag is actually a view of the entries of M

diag.set(2,  1e5)  //Update the 3rd diagonal entry
console.log('M=\n', show(M))
```

Output:

```
diag=
   1.000    3.000    0.000

M=
   1.000    2.000    4.000
   0.000    3.000    5.000
   2.000    1.000  1.00e+5
```

# API

### `require('ndarray-diagonal')(M)`
Construct a view of the diagonal entries of an ndarray

* `M` is an ndarray

**Returns** A view of the diagonal entries of `M`

# Credits
(c) 2014 Mikola Lysenko. MIT License