var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import React from 'react';
import PropTypes from 'prop-types';
import { TOOL_NONE, TOOL_PAN, TOOL_ZOOM_IN, TOOL_ZOOM_OUT, POSITION_RIGHT, POSITION_LEFT } from '../constants';
import { applyToPoints, inverse } from 'transformation-matrix';
import MiniatureToggleButton from './miniature-toggle-button';
import MiniatureMask from './miniature-mask';

var min = Math.min,
    max = Math.max;


export default function Miniature(props) {
  var _style;

  var value = props.value,
      onChangeValue = props.onChangeValue,
      position = props.position,
      children = props.children,
      background = props.background,
      SVGBackground = props.SVGBackground,
      miniatureWidth = props.width,
      miniatureHeight = props.height;
  var SVGWidth = value.SVGWidth,
      SVGHeight = value.SVGHeight,
      viewerWidth = value.viewerWidth,
      viewerHeight = value.viewerHeight;


  var ratio = SVGHeight / SVGWidth;

  var zoomToFit = ratio >= 1 ? miniatureHeight / SVGHeight : miniatureWidth / SVGWidth;

  var _applyToPoints = applyToPoints(inverse(value), [{ x: 0, y: 0 }, { x: viewerWidth, y: viewerHeight }]),
      _applyToPoints2 = _slicedToArray(_applyToPoints, 2),
      _applyToPoints2$ = _applyToPoints2[0],
      x1 = _applyToPoints2$.x,
      y1 = _applyToPoints2$.y,
      _applyToPoints2$2 = _applyToPoints2[1],
      x2 = _applyToPoints2$2.x,
      y2 = _applyToPoints2$2.y;

  var width = void 0,
      height = void 0;
  if (value.miniatureOpen) {
    width = miniatureWidth;
    height = miniatureHeight;
  } else {
    width = 24;
    height = 24;
  }

  var style = (_style = {
    position: "absolute",
    overflow: "hidden",
    outline: "1px solid rgba(19, 20, 22, 0.90)",
    transition: "width 200ms ease, height 200ms ease, bottom 200ms ease",
    width: width + "px",
    height: height + "px",
    bottom: "6px"
  }, _defineProperty(_style, position === POSITION_LEFT ? 'left' : 'right', "6px"), _defineProperty(_style, 'background', background), _style);

  var centerTranslation = ratio >= 1 ? 'translate(' + (miniatureWidth - SVGWidth * zoomToFit) / 2 + ', 0)' : 'translate(0, ' + (miniatureHeight - SVGHeight * zoomToFit) / 2 + ')';

  return React.createElement(
    'div',
    { role: 'navigation', style: style },
    React.createElement(
      'svg',
      {
        width: miniatureWidth,
        height: miniatureHeight,
        style: { pointerEvents: "none" } },
      React.createElement(
        'g',
        { transform: centerTranslation },
        React.createElement(
          'g',
          { transform: 'scale(' + zoomToFit + ', ' + zoomToFit + ')' },
          React.createElement('rect', {
            fill: SVGBackground,
            x: 0,
            y: 0,
            width: value.SVGWidth,
            height: value.SVGHeight }),
          children,
          React.createElement(MiniatureMask, {
            SVGWidth: SVGWidth,
            SVGHeight: SVGHeight,
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            zoomToFit: zoomToFit
          })
        )
      )
    ),
    React.createElement(MiniatureToggleButton, { value: value, onChangeValue: onChangeValue, position: position })
  );
}

Miniature.propTypes = {
  position: PropTypes.oneOf([POSITION_RIGHT, POSITION_LEFT]).isRequired,
  value: PropTypes.object.isRequired,
  onChangeValue: PropTypes.func.isRequired,
  background: PropTypes.string.isRequired,
  SVGBackground: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired
};