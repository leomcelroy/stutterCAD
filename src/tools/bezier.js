import {Point, Bezier, ControlPoint} from '../shapes.js';

const bezierTool = {
  down: (context) => {
    let point = context.state.svgMouse;
    let oldShapes = context.state.shapes;

    let beziers = oldShapes.filter(shape => shape.shape === "bezier");
    let lastBezier = beziers[beziers.length - 1];
    let l = (beziers.length > 0) ? lastBezier.pointList.length : undefined;

    if (!context.state.isDrawing) {

      let newPoint1 = new Point({x:point.x, y:point.y}, context.solver);
      let newPoint2 = new ControlPoint({x:point.x+1, y:point.y+1});
      let newPoint3 = new ControlPoint({x:point.x-1, y:point.y-1});
      let newPoint4 = new Point({x:point.x, y:point.y}, context.solver);
      let bezier = new Bezier(newPoint1, newPoint2, newPoint3, newPoint4, context.solver);

      oldShapes.push(newPoint1);
      oldShapes.push(newPoint2);
      oldShapes.push(newPoint3);
      oldShapes.push(newPoint4);
      oldShapes.push(bezier)

      context.setState({
        shapes: oldShapes,
        isDrawing: true,
        firstPoint: newPoint1,
      });
    } else { //TODO: add auto constraints (check!), auto closing (check!), and length display
      let lastPoint = lastBezier.pointList[l-1];
      let firstPoint = context.state.firstPoint;

      let closed = Math.abs(firstPoint.point.x - lastPoint.point.x) < 10 && Math.abs(firstPoint.point.y - lastPoint.point.y) < 10;

      if (closed) { //TODO: clean up, closing points, essentially un-removable coincident constraint
        lastPoint.controlPoints[0].makePair(firstPoint.controlPoints[0]);

        firstPoint.controlPoints.push(lastPoint.controlPoints[0]);

        lastPoint.id = firstPoint.id;

        lastPoint.controlPoints[0].offset.x = -firstPoint.controlPoints[0].offset.x
        lastPoint.controlPoints[0].offset.y = -firstPoint.controlPoints[0].offset.y

        lastPoint.controlPoints.pop();

        if (l) {lastBezier.pointList[l-4].controlPoints.forEach(p => p.visible = false);}


        context.setState({
          isDrawing: false,
        });

        context.updatePoints();
      } else {
          let newPoint1 = new ControlPoint({x:point.x+1, y:point.y+1});
          let newPoint2 = new ControlPoint({x:point.x-1, y:point.y-1});
          let newPoint3 = new Point({x:point.x, y:point.y}, context.solver);

          let newShapes = context.state.shapes;
          newShapes.push(newPoint1);
          newShapes.push(newPoint2);
          newShapes.push(newPoint3);

          lastBezier.extend(newPoint1, newPoint2, newPoint3);

          // to view last control points
          lastBezier.pointList[l-4].controlPoints.forEach(p => p.visible = false);
          lastBezier.pointList[l-1].controlPoints.forEach(p => p.visible = true);

          context.setState({
            shapes: newShapes,
            isDrawing: true,
          });
      }
    }
  },

  move: (context) => {
    let point = context.state.svgMouse;

    let beziers = context.state.shapes.filter(shape => shape.shape === "bezier");
    let lastBezier = beziers[beziers.length - 1];
    let l = (beziers.length > 0) ? lastBezier.pointList.length : undefined;

    if (context.state.mousedown && context.state.isDrawing) {

      let c1 = lastBezier.pointList[l-3]
      let c2 = lastBezier.pointList[l-2]
      let xID = `x${lastBezier.pointList[l-1].id}`;
      let yID = `y${lastBezier.pointList[l-1].id}`;

      context.solver.vars[xID] = point.x;
      context.solver.vars[yID] = point.y;

      c1.setPoint(point);
      c1.offset = {x:-c1.controlled.point.x + point.x, y:-c1.controlled.point.y + point.y}
      c2.offset = {x:0, y:0}

      if (c1.joint === "symmetric" && c1.pair) {
        c1.pair.offset = {x:c1.controlled.point.x - point.x, y:c1.controlled.point.y - point.y}
      }

    }

    if (context.state.isDrawing) {
      let xID = `x${lastBezier.pointList[l-1].id}`;
      let yID = `y${lastBezier.pointList[l-1].id}`;

      context.solver.vars[xID] = point.x;
      context.solver.vars[yID] = point.y;

      context.updatePoints();
    }
  },
  up: (context) => {},
}

export {bezierTool}
