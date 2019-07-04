"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var environment_1 = require("../environment");
var tensor_util_env_1 = require("../tensor_util_env");
var operation_1 = require("./operation");
function stridedSlice_(x, begin, end, strides, beginMask, endMask) {
    if (beginMask === void 0) { beginMask = 0; }
    if (endMask === void 0) { endMask = 0; }
    var $x = tensor_util_env_1.convertToTensor(x, 'x', 'stridedSlice');
    return environment_1.ENV.engine.runKernel(function (backend) { return backend.stridedSlice($x, begin, end, strides, beginMask, endMask); }, { $x: $x });
}
exports.stridedSlice = operation_1.op({ stridedSlice_: stridedSlice_ });
//# sourceMappingURL=strided_slice.js.map