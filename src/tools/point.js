import {Point} from '../shapes.js';

const pointTool = {
  down: (context) => {
    let point = context.state.svgMouse;
    let oldShapes = context.state.shapes;

    let newPoint = new Point({x:point.x, y:point.y}, context.solver);
    oldShapes.push(newPoint);

    context.setState({
      shapes: oldShapes,
    });
  },

  move: (context) => {},

  up: () => {},
}

export {pointTool}
