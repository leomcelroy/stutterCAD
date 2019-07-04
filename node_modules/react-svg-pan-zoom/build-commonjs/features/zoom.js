'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.isZoomLevelGoingOutOfBounds = isZoomLevelGoingOutOfBounds;
exports.limitZoomLevel = limitZoomLevel;
exports.zoom = zoom;
exports.fitSelection = fitSelection;
exports.fitToViewer = fitToViewer;
exports.zoomOnViewerCenter = zoomOnViewerCenter;
exports.startZooming = startZooming;
exports.updateZooming = updateZooming;
exports.stopZooming = stopZooming;

var _transformationMatrix = require('transformation-matrix');

var _constants = require('../constants');

var _common = require('./common');

var _calculateBox = require('../utils/calculateBox');

var _calculateBox2 = _interopRequireDefault(_calculateBox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function lessThanScaleFactorMin(value, scaleFactor) {
  return value.scaleFactorMin && value.d * scaleFactor <= value.scaleFactorMin;
}

function moreThanScaleFactorMax(value, scaleFactor) {
  return value.scaleFactorMax && value.d * scaleFactor >= value.scaleFactorMax;
}

function isZoomLevelGoingOutOfBounds(value, scaleFactor) {
  return lessThanScaleFactorMin(value, scaleFactor) && scaleFactor < 1 || moreThanScaleFactorMax(value, scaleFactor) && scaleFactor > 1;
}

function limitZoomLevel(value, matrix) {
  var scaleLevel = matrix.a;

  if (value.scaleFactorMin != null) {
    // limit minimum zoom
    scaleLevel = Math.max(scaleLevel, value.scaleFactorMin);
  }

  if (value.scaleFactorMax != null) {
    // limit maximum zoom
    scaleLevel = Math.min(scaleLevel, value.scaleFactorMax);
  }

  return (0, _common.set)(matrix, {
    a: scaleLevel,
    d: scaleLevel
  });
}

function zoom(value, SVGPointX, SVGPointY, scaleFactor) {
  if (isZoomLevelGoingOutOfBounds(value, scaleFactor)) {
    // Do not change translation and scale of value
    return value;
  }

  var matrix = (0, _transformationMatrix.transform)((0, _transformationMatrix.fromObject)(value), (0, _transformationMatrix.translate)(SVGPointX, SVGPointY), (0, _transformationMatrix.scale)(scaleFactor, scaleFactor), (0, _transformationMatrix.translate)(-SVGPointX, -SVGPointY));

  return (0, _common.set)(value, _extends({
    mode: _constants.MODE_IDLE
  }, limitZoomLevel(value, matrix), {
    startX: null,
    startY: null,
    endX: null,
    endY: null
  }), _constants.ACTION_ZOOM);
}

function fitSelection(value, selectionSVGPointX, selectionSVGPointY, selectionWidth, selectionHeight) {
  var viewerWidth = value.viewerWidth,
      viewerHeight = value.viewerHeight;


  var scaleX = viewerWidth / selectionWidth;
  var scaleY = viewerHeight / selectionHeight;

  var scaleLevel = Math.min(scaleX, scaleY);

  var matrix = (0, _transformationMatrix.transform)((0, _transformationMatrix.scale)(scaleLevel, scaleLevel), //2
  (0, _transformationMatrix.translate)(-selectionSVGPointX, -selectionSVGPointY) //1
  );

  if (isZoomLevelGoingOutOfBounds(value, scaleLevel / value.d)) {
    // Do not allow scale and translation
    return (0, _common.set)(value, {
      mode: _constants.MODE_IDLE,
      startX: null,
      startY: null,
      endX: null,
      endY: null
    });
  }

  return (0, _common.set)(value, _extends({
    mode: _constants.MODE_IDLE
  }, limitZoomLevel(value, matrix), {
    startX: null,
    startY: null,
    endX: null,
    endY: null
  }), _constants.ACTION_ZOOM);
}

function fitToViewer(value) {
  var SVGAlignX = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _constants.ALIGN_LEFT;
  var SVGAlignY = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _constants.ALIGN_TOP;
  var viewerWidth = value.viewerWidth,
      viewerHeight = value.viewerHeight,
      SVGWidth = value.SVGWidth,
      SVGHeight = value.SVGHeight;


  var scaleX = viewerWidth / SVGWidth;
  var scaleY = viewerHeight / SVGHeight;
  var scaleLevel = Math.min(scaleX, scaleY);

  var scaleMatrix = (0, _transformationMatrix.scale)(scaleLevel, scaleLevel);
  var translationMatrix = (0, _transformationMatrix.translate)(0, 0);

  // after fitting, SVG and the viewer will match in width (1) or in height (2)
  if (scaleX < scaleY) {
    //(1) match in width, meaning scaled SVGHeight <= viewerHeight
    var remainderY = viewerHeight - scaleX * SVGHeight;

    if (SVGAlignY === _constants.ALIGN_CENTER) translationMatrix = (0, _transformationMatrix.translate)(0, Math.round(remainderY / 2));
    if (SVGAlignY === _constants.ALIGN_BOTTOM) translationMatrix = (0, _transformationMatrix.translate)(0, remainderY);
  } else {
    //(2) match in height, meaning scaled SVGWidth <= viewerWidth
    var remainderX = viewerWidth - scaleY * SVGWidth;

    if (SVGAlignX === _constants.ALIGN_CENTER) translationMatrix = (0, _transformationMatrix.translate)(Math.round(remainderX / 2), 0);
    if (SVGAlignX === _constants.ALIGN_RIGHT) translationMatrix = (0, _transformationMatrix.translate)(remainderX, 0);
  }

  var matrix = (0, _transformationMatrix.transform)(translationMatrix, //2
  scaleMatrix //1
  );

  if (isZoomLevelGoingOutOfBounds(value, scaleLevel / value.d)) {
    // Do not allow scale and translation
    return (0, _common.set)(value, {
      mode: _constants.MODE_IDLE,
      startX: null,
      startY: null,
      endX: null,
      endY: null
    });
  }

  return (0, _common.set)(value, _extends({
    mode: _constants.MODE_IDLE
  }, limitZoomLevel(value, matrix), {
    startX: null,
    startY: null,
    endX: null,
    endY: null
  }), _constants.ACTION_ZOOM);
}

function zoomOnViewerCenter(value, scaleFactor) {
  var viewerWidth = value.viewerWidth,
      viewerHeight = value.viewerHeight;

  var SVGPoint = (0, _common.getSVGPoint)(value, viewerWidth / 2, viewerHeight / 2);
  return zoom(value, SVGPoint.x, SVGPoint.y, scaleFactor);
}

function startZooming(value, viewerX, viewerY) {
  return (0, _common.set)(value, {
    mode: _constants.MODE_ZOOMING,
    startX: viewerX,
    startY: viewerY,
    endX: viewerX,
    endY: viewerY
  });
}

function updateZooming(value, viewerX, viewerY) {
  if (value.mode !== _constants.MODE_ZOOMING) throw new Error('update selection not allowed in this mode ' + value.mode);

  return (0, _common.set)(value, {
    endX: viewerX,
    endY: viewerY
  });
}

function stopZooming(value, viewerX, viewerY, scaleFactor, props) {
  var startX = value.startX,
      startY = value.startY,
      endX = value.endX,
      endY = value.endY;


  var start = (0, _common.getSVGPoint)(value, startX, startY);
  var end = (0, _common.getSVGPoint)(value, endX, endY);

  if (Math.abs(startX - endX) > 7 && Math.abs(startY - endY) > 7) {
    var box = (0, _calculateBox2.default)(start, end);
    return fitSelection(value, box.x, box.y, box.width, box.height);
  } else {
    var SVGPoint = (0, _common.getSVGPoint)(value, viewerX, viewerY);
    return zoom(value, SVGPoint.x, SVGPoint.y, scaleFactor, props);
  }
}