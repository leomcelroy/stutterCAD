'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.onTouchStart = onTouchStart;
exports.onTouchMove = onTouchMove;
exports.onTouchEnd = onTouchEnd;
exports.onTouchCancel = onTouchCancel;

var _transformationMatrix = require('transformation-matrix');

var _constants = require('../constants');

var _common = require('./common');

var _interactions = require('./interactions');

var _zoom = require('./zoom');

function hasPinchPointDistance(value) {
  return typeof value.pinchPointDistance === 'number';
}

function onMultiTouch(event, ViewerDOM, tool, value, props) {
  var _ViewerDOM$getBoundin = ViewerDOM.getBoundingClientRect(),
      left = _ViewerDOM$getBoundin.left,
      top = _ViewerDOM$getBoundin.top;

  var x1 = event.touches[0].clientX - Math.round(left);
  var y1 = event.touches[0].clientY - Math.round(top);
  var x2 = event.touches[1].clientX - Math.round(left);
  var y2 = event.touches[1].clientY - Math.round(top);
  var pinchPointDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  var previousPointDistance = hasPinchPointDistance(value) ? value.pinchPointDistance : pinchPointDistance;
  var svgPoint = (0, _common.getSVGPoint)(value, (x1 + x2) / 2, (y1 + y2) / 2);
  var distanceFactor = pinchPointDistance / previousPointDistance;

  if ((0, _zoom.isZoomLevelGoingOutOfBounds)(value, distanceFactor)) {
    // Do not change translation and scale of value
    return value;
  }

  if (event.cancelable) {
    event.preventDefault();
  }

  var matrix = (0, _transformationMatrix.transform)((0, _transformationMatrix.fromObject)(value), (0, _transformationMatrix.translate)(svgPoint.x, svgPoint.y), (0, _transformationMatrix.scale)(distanceFactor, distanceFactor), (0, _transformationMatrix.translate)(-svgPoint.x, -svgPoint.y));

  return (0, _common.set)(value, (0, _common.set)(_extends({
    mode: _constants.MODE_ZOOMING
  }, (0, _zoom.limitZoomLevel)(value, matrix), {
    startX: null,
    startY: null,
    endX: null,
    endY: null,
    prePinchMode: value.prePinchMode ? value.prePinchMode : value.mode,
    pinchPointDistance: pinchPointDistance
  })));
}

function isMultiTouch(event, props) {
  return props.detectPinchGesture && event.touches.length > 1;
}

function shouldResetPinchPointDistance(event, value, props) {
  return props.detectPinchGesture && hasPinchPointDistance(value) && event.touches.length < 2;
}

function getTouchPosition(touch, ViewerDOM) {
  var _ViewerDOM$getBoundin2 = ViewerDOM.getBoundingClientRect(),
      left = _ViewerDOM$getBoundin2.left,
      top = _ViewerDOM$getBoundin2.top;

  var x = touch.clientX - Math.round(left);
  var y = touch.clientY - Math.round(top);

  return { x: x, y: y };
}

function getNextValue(event, ViewerDOM, tool, value, props, nextValueFn) {
  var nextValue = event.touches.length === 0 ? (0, _common.set)(value, { mode: value.prePinchMode ? _constants.MODE_IDLE : value.mode, prePinchMode: null }) : value;
  var touch = event.touches.length > 0 ? event.touches[0] : event.changedTouches[0];
  var touchPosition = getTouchPosition(touch, ViewerDOM);

  switch (tool) {
    case _constants.TOOL_ZOOM_OUT:
    case _constants.TOOL_ZOOM_IN:
    case _constants.TOOL_AUTO:
    case _constants.TOOL_PAN:
      event.stopPropagation();
      event.preventDefault();
      return nextValueFn(event, ViewerDOM, tool, nextValue, props, touchPosition);

    default:
      return nextValue;
  }
}

function onTouchStart(event, ViewerDOM, tool, value, props) {
  if (isMultiTouch(event, props)) {
    return onMultiTouch(event, ViewerDOM, tool, value, props);
  }

  if (event.touches.length !== 1) {
    if ([_constants.MODE_PANNING, _constants.MODE_ZOOMING].indexOf(value.mode) >= 0) {
      return (0, _common.resetMode)(value);
    } else if ([_constants.MODE_IDLE].indexOf(value.mode) >= 0) {
      return value;
    }
  }

  return getNextValue(event, ViewerDOM, tool, value, props, _interactions.onMouseDown);
}

function onTouchMove(event, ViewerDOM, tool, value, props) {
  if (isMultiTouch(event, props)) {
    return onMultiTouch(event, ViewerDOM, tool, value, props);
  }

  if (!([_constants.MODE_PANNING, _constants.MODE_ZOOMING].indexOf(value.mode) >= 0)) {
    return value;
  }

  return getNextValue(event, ViewerDOM, tool, value, props, _interactions.onMouseMove);
}

function onTouchEnd(event, ViewerDOM, tool, value, props) {
  if (!([_constants.MODE_PANNING, _constants.MODE_ZOOMING].indexOf(value.mode) >= 0)) {
    return value;
  }

  var nextValue = shouldResetPinchPointDistance(event, value, props) ? (0, _common.set)(value, { pinchPointDistance: null }) : value;

  if (event.touches.length > 0) {
    return nextValue;
  }

  return getNextValue(event, ViewerDOM, tool, nextValue, props, _interactions.onMouseUp);
}

function onTouchCancel(event, ViewerDOM, tool, value, props) {
  event.stopPropagation();
  event.preventDefault();

  return (0, _common.resetMode)(value);
}