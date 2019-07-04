import {Point, Circle} from '../shapes.js';

const circleTool = {
  down: (context) => {
    let point = context.state.svgMouse;
    let oldShapes = context.state.shapes;

    let c = new Point({x:point.x, y:point.y}, context.solver);
    let p1 = new Point({x:point.x+1, y:point.y+1}, context.solver);
    let circle = new Circle(c, p1); // needs context for setting hiddenConstraints

    oldShapes.push(c);
    oldShapes.push(p1);
    oldShapes.push(circle);

    context.setState({
      shapes: oldShapes,
      isDrawing: true,
    });
  },

  move: (context) => {
    let point = context.state.svgMouse;

    if (context.state.isDrawing) {
      let circles = context.state.shapes.filter(s => s.shape === "circle");
      let l = circles.length;
      let lastCircle = circles[l-1];

      let id = lastCircle.pointList[1].id;

      context.solver.vars[`x${id}`] = point.x;
      context.solver.vars[`y${id}`] = point.y;

      context.updatePoints();
    }
  },

  up: (context) => {
    context.setState({isDrawing:false})
  },
}

export {circleTool}
