'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _RandomUID = require('../utils/RandomUID');

var _RandomUID2 = _interopRequireDefault(_RandomUID);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var prefixID = 'react-svg-pan-zoom_miniature';

function MiniatureMask(_ref) {
  var SVGWidth = _ref.SVGWidth,
      SVGHeight = _ref.SVGHeight,
      x1 = _ref.x1,
      y1 = _ref.y1,
      x2 = _ref.x2,
      y2 = _ref.y2,
      zoomToFit = _ref.zoomToFit,
      _uid = _ref._uid;

  var maskID = prefixID + '_mask_' + _uid;

  return _react2.default.createElement(
    'g',
    null,
    _react2.default.createElement(
      'defs',
      null,
      _react2.default.createElement(
        'mask',
        { id: maskID },
        _react2.default.createElement('rect', { x: '0', y: '0', width: SVGWidth, height: SVGHeight, fill: '#ffffff' }),
        _react2.default.createElement('rect', { x: x1, y: y1, width: x2 - x1, height: y2 - y1 })
      )
    ),
    _react2.default.createElement('rect', {
      x: '0',
      y: '0',
      width: SVGWidth,
      height: SVGHeight,
      style: {
        stroke: "none",
        fill: "#000",
        mask: 'url(#' + maskID + ')',
        opacity: 0.4
      }
    })
  );
}

MiniatureMask.propTypes = {
  SVGWidth: _propTypes2.default.number.isRequired,
  SVGHeight: _propTypes2.default.number.isRequired,
  x1: _propTypes2.default.number.isRequired,
  y1: _propTypes2.default.number.isRequired,
  x2: _propTypes2.default.number.isRequired,
  y2: _propTypes2.default.number.isRequired,
  zoomToFit: _propTypes2.default.number.isRequired
};

exports.default = (0, _RandomUID2.default)(MiniatureMask);