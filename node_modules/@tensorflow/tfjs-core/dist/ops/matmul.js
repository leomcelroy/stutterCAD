"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var environment_1 = require("../environment");
var tensor_util_env_1 = require("../tensor_util_env");
var util = require("../util");
var operation_1 = require("./operation");
function matMul_(a, b, transposeA, transposeB) {
    if (transposeA === void 0) { transposeA = false; }
    if (transposeB === void 0) { transposeB = false; }
    var $a = tensor_util_env_1.convertToTensor(a, 'a', 'matMul');
    var $b = tensor_util_env_1.convertToTensor(b, 'b', 'matMul');
    var innerShapeA = transposeA ? $a.shape[0] : $a.shape[1];
    var innerShapeB = transposeB ? $b.shape[1] : $b.shape[0];
    util.assert($a.rank === 2 && $b.rank === 2, "Error in matMul: inputs must be rank 2, got ranks " + $a.rank +
        (" and " + $b.rank + "."));
    util.assert(innerShapeA === innerShapeB, "Error in matMul: inner shapes (" + innerShapeA + ") and (" +
        (innerShapeB + ") of Tensors with shapes " + $a.shape + " and ") +
        ($b.shape + " and transposeA=" + transposeA) +
        (" and transposeB=" + transposeB + " must match."));
    var grad = function (dy) {
        if (!transposeA && !transposeB) {
            return {
                $a: function () { return dy.matMul($b.toFloat(), false, true); },
                $b: function () { return $a.toFloat().matMul(dy, true, false); }
            };
        }
        else if (!transposeA && transposeB) {
            return {
                $a: function () { return dy.matMul($b.toFloat(), false, false); },
                $b: function () { return dy.matMul($a.toFloat(), true, false); }
            };
        }
        else if (transposeA && !transposeB) {
            return {
                $a: function () { return $b.toFloat().matMul(dy, false, true); },
                $b: function () { return $a.toFloat().matMul(dy, false, false); }
            };
        }
        else {
            return {
                $a: function () { return $b.toFloat().matMul(dy, true, true); },
                $b: function () { return dy.matMul($a.toFloat(), true, true); }
            };
        }
    };
    return environment_1.ENV.engine.runKernel(function (backend) { return backend.matMul($a, $b, transposeA, transposeB); }, { $a: $a, $b: $b }, grad);
}
function outerProduct_(v1, v2) {
    var $v1 = tensor_util_env_1.convertToTensor(v1, 'v1', 'outerProduct');
    var $v2 = tensor_util_env_1.convertToTensor(v2, 'v2', 'outerProduct');
    util.assert($v1.rank === 1 && $v2.rank === 1, "Error in outerProduct: inputs must be rank 1, but got ranks " +
        ($v1.rank + " and " + $v2.rank + "."));
    return $v1.as2D(-1, 1).matMul($v2.as2D(1, -1));
}
function dot_(t1, t2) {
    var $t1 = tensor_util_env_1.convertToTensor(t1, 't1', 'dot');
    var $t2 = tensor_util_env_1.convertToTensor(t2, 't2', 'dot');
    util.assert(($t1.rank === 1 || $t1.rank === 2) && ($t2.rank === 1 || $t2.rank === 2), "Error in dot: inputs must all be rank 1 or 2, but got ranks " +
        ($t1.rank + " and " + $t2.rank + "."));
    var t1Inner = ($t1.rank === 1 ? $t1.size : $t1.shape[1]);
    var t2Inner = ($t2.rank === 1 ? $t2.size : $t2.shape[0]);
    util.assert(t1Inner === t2Inner, "Error in dot: inner dimensions of inputs must match, but got " +
        (t1Inner + " and " + t2Inner + "."));
    if ($t1.rank === 1 && $t2.rank === 1) {
        return $t1.as2D(1, -1).matMul($t2.as2D(-1, 1)).asScalar();
    }
    else if ($t1.rank === 1 && $t2.rank === 2) {
        return $t1.as2D(1, -1).matMul($t2.as2D($t2.shape[0], $t2.shape[1])).as1D();
    }
    else if ($t1.rank === 2 && $t2.rank === 1) {
        return $t1.matMul($t2.as2D(-1, 1)).as1D();
    }
    else {
        return $t1.matMul($t2.as2D($t2.shape[0], $t2.shape[1]));
    }
}
exports.matMul = operation_1.op({ matMul_: matMul_ });
exports.dot = operation_1.op({ dot_: dot_ });
exports.outerProduct = operation_1.op({ outerProduct_: outerProduct_ });
//# sourceMappingURL=matmul.js.map