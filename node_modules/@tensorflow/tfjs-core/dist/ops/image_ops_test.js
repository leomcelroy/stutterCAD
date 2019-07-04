"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tf = require("../index");
var jasmine_util_1 = require("../jasmine_util");
var test_util_1 = require("../test_util");
jasmine_util_1.describeWithFlags('nonMaxSuppression', test_util_1.ALL_ENVS, function () {
    it('select from three clusters', function () {
        var boxes = tf.tensor2d([
            0, 0, 1, 1, 0, 0.1, 1, 1.1, 0, -0.1, 1, 0.9,
            0, 10, 1, 11, 0, 10.1, 1, 11.1, 0, 100, 1, 101
        ], [6, 4]);
        var scores = tf.tensor1d([0.9, 0.75, 0.6, 0.95, 0.5, 0.3]);
        var maxOutputSize = 3;
        var iouThreshold = 0.5;
        var scoreThreshold = 0;
        var indices = tf.image.nonMaxSuppression(boxes, scores, maxOutputSize, iouThreshold, scoreThreshold);
        expect(indices.shape).toEqual([3]);
        test_util_1.expectArraysEqual(indices, [3, 0, 5]);
    });
    it('select from three clusters flipped coordinates', function () {
        var boxes = tf.tensor2d([
            1, 1, 0, 0, 0, 0.1, 1, 1.1, 0, .9, 1, -0.1,
            0, 10, 1, 11, 1, 10.1, 0, 11.1, 1, 101, 0, 100
        ], [6, 4]);
        var scores = tf.tensor1d([0.9, 0.75, 0.6, 0.95, 0.5, 0.3]);
        var maxOutputSize = 3;
        var iouThreshold = 0.5;
        var scoreThreshold = 0;
        var indices = tf.image.nonMaxSuppression(boxes, scores, maxOutputSize, iouThreshold, scoreThreshold);
        expect(indices.shape).toEqual([3]);
        test_util_1.expectArraysEqual(indices, [3, 0, 5]);
    });
    it('select at most two boxes from three clusters', function () {
        var boxes = tf.tensor2d([
            0, 0, 1, 1, 0, 0.1, 1, 1.1, 0, -0.1, 1, 0.9,
            0, 10, 1, 11, 0, 10.1, 1, 11.1, 0, 100, 1, 101
        ], [6, 4]);
        var scores = tf.tensor1d([0.9, 0.75, 0.6, 0.95, 0.5, 0.3]);
        var maxOutputSize = 2;
        var iouThreshold = 0.5;
        var scoreThreshold = 0;
        var indices = tf.image.nonMaxSuppression(boxes, scores, maxOutputSize, iouThreshold, scoreThreshold);
        expect(indices.shape).toEqual([2]);
        test_util_1.expectArraysEqual(indices, [3, 0]);
    });
    it('select at most thirty boxes from three clusters', function () {
        var boxes = tf.tensor2d([
            0, 0, 1, 1, 0, 0.1, 1, 1.1, 0, -0.1, 1, 0.9,
            0, 10, 1, 11, 0, 10.1, 1, 11.1, 0, 100, 1, 101
        ], [6, 4]);
        var scores = tf.tensor1d([0.9, 0.75, 0.6, 0.95, 0.5, 0.3]);
        var maxOutputSize = 30;
        var iouThreshold = 0.5;
        var scoreThreshold = 0;
        var indices = tf.image.nonMaxSuppression(boxes, scores, maxOutputSize, iouThreshold, scoreThreshold);
        expect(indices.shape).toEqual([3]);
        test_util_1.expectArraysEqual(indices, [3, 0, 5]);
    });
    it('select single box', function () {
        var boxes = tf.tensor2d([0, 0, 1, 1], [1, 4]);
        var scores = tf.tensor1d([0.9]);
        var maxOutputSize = 3;
        var iouThreshold = 0.5;
        var scoreThreshold = 0;
        var indices = tf.image.nonMaxSuppression(boxes, scores, maxOutputSize, iouThreshold, scoreThreshold);
        expect(indices.shape).toEqual([1]);
        test_util_1.expectArraysEqual(indices, [0]);
    });
    it('select from ten identical boxes', function () {
        var boxes = tf.tensor2d([0, 0, 1, 1], [1, 4]);
        var scores = tf.tensor1d([0.9]);
        var maxOutputSize = 3;
        var iouThreshold = 0.5;
        var scoreThreshold = 0;
        var indices = tf.image.nonMaxSuppression(boxes, scores, maxOutputSize, iouThreshold, scoreThreshold);
        expect(indices.shape).toEqual([1]);
        test_util_1.expectArraysEqual(indices, [0]);
    });
    it('select from ten identical boxes', function () {
        var numBoxes = 10;
        var corners = Array(numBoxes)
            .fill(0)
            .map(function (_) { return [0, 0, 1, 1]; })
            .reduce(function (arr, curr) { return arr.concat(curr); });
        var boxes = tf.tensor2d(corners, [numBoxes, 4]);
        var scores = tf.tensor1d(Array(numBoxes).fill(0.9));
        var maxOutputSize = 3;
        var iouThreshold = 0.5;
        var scoreThreshold = 0;
        var indices = tf.image.nonMaxSuppression(boxes, scores, maxOutputSize, iouThreshold, scoreThreshold);
        expect(indices.shape).toEqual([1]);
        test_util_1.expectArraysEqual(indices, [0]);
    });
    it('inconsistent box and score shapes', function () {
        var boxes = tf.tensor2d([
            0, 0, 1, 1, 0, 0.1, 1, 1.1, 0, -0.1, 1, 0.9,
            0, 10, 1, 11, 0, 10.1, 1, 11.1, 0, 100, 1, 101
        ], [6, 4]);
        var scores = tf.tensor1d([0.9, 0.75, 0.6, 0.95, 0.5]);
        var maxOutputSize = 30;
        var iouThreshold = 0.5;
        var scoreThreshold = 0;
        expect(function () { return tf.image.nonMaxSuppression(boxes, scores, maxOutputSize, iouThreshold, scoreThreshold); })
            .toThrowError(/scores has incompatible shape with boxes/);
    });
    it('invalid iou threshold', function () {
        var boxes = tf.tensor2d([0, 0, 1, 1], [1, 4]);
        var scores = tf.tensor1d([0.9]);
        var maxOutputSize = 3;
        var iouThreshold = 1.2;
        var scoreThreshold = 0;
        expect(function () { return tf.image.nonMaxSuppression(boxes, scores, maxOutputSize, iouThreshold, scoreThreshold); })
            .toThrowError(/iouThreshold must be in \[0, 1\]/);
    });
    it('empty input', function () {
        var boxes = tf.tensor2d([], [0, 4]);
        var scores = tf.tensor1d([]);
        var maxOutputSize = 3;
        var iouThreshold = 0.5;
        var scoreThreshold = 0;
        var indices = tf.image.nonMaxSuppression(boxes, scores, maxOutputSize, iouThreshold, scoreThreshold);
        expect(indices.shape).toEqual([0]);
        test_util_1.expectArraysEqual(indices, []);
    });
    it('accepts a tensor-like object', function () {
        var boxes = [[0, 0, 1, 1], [0, 1, 1, 2]];
        var scores = [1, 2];
        var indices = tf.image.nonMaxSuppression(boxes, scores, 10);
        expect(indices.shape).toEqual([2]);
        expect(indices.dtype).toEqual('int32');
        test_util_1.expectArraysEqual(indices, [1, 0]);
    });
});
jasmine_util_1.describeWithFlags('nonMaxSuppressionAsync', test_util_1.ALL_ENVS, function () {
    it('select from three clusters', function () { return __awaiter(_this, void 0, void 0, function () {
        var boxes, scores, maxOutputSize, iouThreshold, scoreThreshold, indices;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    boxes = tf.tensor2d([
                        0, 0, 1, 1, 0, 0.1, 1, 1.1, 0, -0.1, 1, 0.9,
                        0, 10, 1, 11, 0, 10.1, 1, 11.1, 0, 100, 1, 101
                    ], [6, 4]);
                    scores = tf.tensor1d([0.9, 0.75, 0.6, 0.95, 0.5, 0.3]);
                    maxOutputSize = 3;
                    iouThreshold = 0.5;
                    scoreThreshold = 0;
                    return [4, tf.image.nonMaxSuppressionAsync(boxes, scores, maxOutputSize, iouThreshold, scoreThreshold)];
                case 1:
                    indices = _a.sent();
                    expect(indices.shape).toEqual([3]);
                    test_util_1.expectArraysEqual(indices, [3, 0, 5]);
                    return [2];
            }
        });
    }); });
    it('accepts a tensor-like object', function () { return __awaiter(_this, void 0, void 0, function () {
        var boxes, scores, indices;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    boxes = [[0, 0, 1, 1], [0, 1, 1, 2]];
                    scores = [1, 2];
                    return [4, tf.image.nonMaxSuppressionAsync(boxes, scores, 10)];
                case 1:
                    indices = _a.sent();
                    expect(indices.shape).toEqual([2]);
                    expect(indices.dtype).toEqual('int32');
                    test_util_1.expectArraysEqual(indices, [1, 0]);
                    return [2];
            }
        });
    }); });
});
//# sourceMappingURL=image_ops_test.js.map