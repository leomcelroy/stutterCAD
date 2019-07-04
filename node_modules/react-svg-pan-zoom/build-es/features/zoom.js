var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

import { transform, fromObject, translate, scale } from 'transformation-matrix';

import { ACTION_ZOOM, MODE_IDLE, MODE_ZOOMING, ALIGN_CENTER, ALIGN_LEFT, ALIGN_RIGHT, ALIGN_TOP, ALIGN_BOTTOM } from '../constants';
import { set, getSVGPoint } from './common';
import calculateBox from '../utils/calculateBox';

function lessThanScaleFactorMin(value, scaleFactor) {
  return value.scaleFactorMin && value.d * scaleFactor <= value.scaleFactorMin;
}

function moreThanScaleFactorMax(value, scaleFactor) {
  return value.scaleFactorMax && value.d * scaleFactor >= value.scaleFactorMax;
}

export function isZoomLevelGoingOutOfBounds(value, scaleFactor) {
  return lessThanScaleFactorMin(value, scaleFactor) && scaleFactor < 1 || moreThanScaleFactorMax(value, scaleFactor) && scaleFactor > 1;
}

export function limitZoomLevel(value, matrix) {
  var scaleLevel = matrix.a;

  if (value.scaleFactorMin != null) {
    // limit minimum zoom
    scaleLevel = Math.max(scaleLevel, value.scaleFactorMin);
  }

  if (value.scaleFactorMax != null) {
    // limit maximum zoom
    scaleLevel = Math.min(scaleLevel, value.scaleFactorMax);
  }

  return set(matrix, {
    a: scaleLevel,
    d: scaleLevel
  });
}

export function zoom(value, SVGPointX, SVGPointY, scaleFactor) {
  if (isZoomLevelGoingOutOfBounds(value, scaleFactor)) {
    // Do not change translation and scale of value
    return value;
  }

  var matrix = transform(fromObject(value), translate(SVGPointX, SVGPointY), scale(scaleFactor, scaleFactor), translate(-SVGPointX, -SVGPointY));

  return set(value, _extends({
    mode: MODE_IDLE
  }, limitZoomLevel(value, matrix), {
    startX: null,
    startY: null,
    endX: null,
    endY: null
  }), ACTION_ZOOM);
}

export function fitSelection(value, selectionSVGPointX, selectionSVGPointY, selectionWidth, selectionHeight) {
  var viewerWidth = value.viewerWidth,
      viewerHeight = value.viewerHeight;


  var scaleX = viewerWidth / selectionWidth;
  var scaleY = viewerHeight / selectionHeight;

  var scaleLevel = Math.min(scaleX, scaleY);

  var matrix = transform(scale(scaleLevel, scaleLevel), //2
  translate(-selectionSVGPointX, -selectionSVGPointY) //1
  );

  if (isZoomLevelGoingOutOfBounds(value, scaleLevel / value.d)) {
    // Do not allow scale and translation
    return set(value, {
      mode: MODE_IDLE,
      startX: null,
      startY: null,
      endX: null,
      endY: null
    });
  }

  return set(value, _extends({
    mode: MODE_IDLE
  }, limitZoomLevel(value, matrix), {
    startX: null,
    startY: null,
    endX: null,
    endY: null
  }), ACTION_ZOOM);
}

export function fitToViewer(value) {
  var SVGAlignX = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ALIGN_LEFT;
  var SVGAlignY = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ALIGN_TOP;
  var viewerWidth = value.viewerWidth,
      viewerHeight = value.viewerHeight,
      SVGWidth = value.SVGWidth,
      SVGHeight = value.SVGHeight;


  var scaleX = viewerWidth / SVGWidth;
  var scaleY = viewerHeight / SVGHeight;
  var scaleLevel = Math.min(scaleX, scaleY);

  var scaleMatrix = scale(scaleLevel, scaleLevel);
  var translationMatrix = translate(0, 0);

  // after fitting, SVG and the viewer will match in width (1) or in height (2)
  if (scaleX < scaleY) {
    //(1) match in width, meaning scaled SVGHeight <= viewerHeight
    var remainderY = viewerHeight - scaleX * SVGHeight;

    if (SVGAlignY === ALIGN_CENTER) translationMatrix = translate(0, Math.round(remainderY / 2));
    if (SVGAlignY === ALIGN_BOTTOM) translationMatrix = translate(0, remainderY);
  } else {
    //(2) match in height, meaning scaled SVGWidth <= viewerWidth
    var remainderX = viewerWidth - scaleY * SVGWidth;

    if (SVGAlignX === ALIGN_CENTER) translationMatrix = translate(Math.round(remainderX / 2), 0);
    if (SVGAlignX === ALIGN_RIGHT) translationMatrix = translate(remainderX, 0);
  }

  var matrix = transform(translationMatrix, //2
  scaleMatrix //1
  );

  if (isZoomLevelGoingOutOfBounds(value, scaleLevel / value.d)) {
    // Do not allow scale and translation
    return set(value, {
      mode: MODE_IDLE,
      startX: null,
      startY: null,
      endX: null,
      endY: null
    });
  }

  return set(value, _extends({
    mode: MODE_IDLE
  }, limitZoomLevel(value, matrix), {
    startX: null,
    startY: null,
    endX: null,
    endY: null
  }), ACTION_ZOOM);
}

export function zoomOnViewerCenter(value, scaleFactor) {
  var viewerWidth = value.viewerWidth,
      viewerHeight = value.viewerHeight;

  var SVGPoint = getSVGPoint(value, viewerWidth / 2, viewerHeight / 2);
  return zoom(value, SVGPoint.x, SVGPoint.y, scaleFactor);
}

export function startZooming(value, viewerX, viewerY) {
  return set(value, {
    mode: MODE_ZOOMING,
    startX: viewerX,
    startY: viewerY,
    endX: viewerX,
    endY: viewerY
  });
}

export function updateZooming(value, viewerX, viewerY) {
  if (value.mode !== MODE_ZOOMING) throw new Error('update selection not allowed in this mode ' + value.mode);

  return set(value, {
    endX: viewerX,
    endY: viewerY
  });
}

export function stopZooming(value, viewerX, viewerY, scaleFactor, props) {
  var startX = value.startX,
      startY = value.startY,
      endX = value.endX,
      endY = value.endY;


  var start = getSVGPoint(value, startX, startY);
  var end = getSVGPoint(value, endX, endY);

  if (Math.abs(startX - endX) > 7 && Math.abs(startY - endY) > 7) {
    var box = calculateBox(start, end);
    return fitSelection(value, box.x, box.y, box.width, box.height);
  } else {
    var SVGPoint = getSVGPoint(value, viewerX, viewerY);
    return zoom(value, SVGPoint.x, SVGPoint.y, scaleFactor, props);
  }
}