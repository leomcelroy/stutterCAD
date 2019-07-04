'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getDisplayName;
//https://facebook.github.io/react/docs/higher-order-components.html#convention-wrap-the-display-name-for-easy-debugging
function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}