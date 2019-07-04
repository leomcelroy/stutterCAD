import {ControlPoint, Clone} from '../shapes.js';

const selectTool = {
  down: (context) => {
    let point = context.state.svgMouse;

    context.setState({pivot:point});

    context.state.shapes.forEach(shape => {
      let d = new Date();
      let doubleClick = (d.getTime() - context.state.lastClick) < 400 ? true : false;

      //let bool = shape.select(point, doubleClick)
      let bool = shape.hover;

      if (bool) {
        context.setState({
          pivotID: shape.id,
        });

        shape.selectBoolean(true);

        if (doubleClick) {shape.selectBoolean(false);}

        if (doubleClick && shape.shape === "bezier") {
          shape.pointList.forEach(p => {
            if (p instanceof ControlPoint) {
              p.visible = !p.visible
            }
          })
        }

      }

    })

    context.setState({selectionBox:{x:[point.x, point.x], y:[point.y, point.y]}})
  },

  move: (context) => {
    let point = context.state.svgMouse;

    context.state.shapes.forEach(s => {
      //if (s.select(point) && !context.state.dragging) {
      if (s.hover && !context.state.dragging) {
        s.highlight = true;
        s.showConstraints = true;
      } else {
        s.highlight = false;
        s.showConstraints = false;
      }
    })


    let box = context.state.selectionBox;
    let area = Math.abs(box.x[0] - box.x[1]) *  Math.abs(box.y[0] - box.y[1]);

    if (context.state.mousedown === true) {
      let bool = context.state.shapes.some(shape => {
        if (shape.selected === true && area === 0) {
          //return shape.select(point) === true
          return shape.hover === true;
        }
        return false;
      });

      if (bool) {
        context.setState( { dragging:true } )
      } else {
        let ogX = context.state.selectionBox.x[0];
        let ogY = context.state.selectionBox.y[0];
        context.setState({selectionBox:{x:[ogX, point.x], y:[ogY,point.y]}})
      };
    }

    if (context.state.dragging) {
      context.setState({
        pivot:point,
      });

      context.state.shapes.forEach(shape => {

        if (shape.shape === "point") {
          if (shape.selected === true) {

            let xID = `x${shape.id}`;
            let yID = `y${shape.id}`;

            let xOffset = shape.point.x-context.state.pivot.x;
            let yOffset = shape.point.y-context.state.pivot.y;

            if (shape.id === context.state.pivotID && !(shape instanceof ControlPoint) && !(shape instanceof Clone)) { //if point fixed it should not have a new suggestion
              context.solver.vars[xID] = point.x;
              context.solver.vars[yID] = point.y;

            } else if (shape instanceof Clone) {
              if (shape.id === context.state.pivotID) { // is context needed wouldnt offset be 0?
                shape.setPoint(point);
                shape.offset = {x:-shape.progenitor.point.x + point.x, y:-shape.progenitor.point.y + point.y};
              } else {
                let newPoint = {x: point.x + xOffset, y: point.y + yOffset}
                shape.setPoint(newPoint);
                shape.offset = {x:-shape.progenitor.point.x + point.x + xOffset, y:-shape.progenitor.point.y + point.y + yOffset};
              }
            } else if (shape instanceof ControlPoint) { //it is a control point
              if (shape.id === context.state.pivotID) { // is context needed wouldnt offset be 0?
                shape.setPoint(point);
                shape.offset = {x:-shape.controlled.point.x + point.x, y:-shape.controlled.point.y + point.y};

                if (shape.pair && shape.joint === "symmetric") {
                  shape.pair.offset = {x:shape.controlled.point.x - point.x, y:shape.controlled.point.y - point.y}
                }
              } else {
                let newPoint = {x: point.x + xOffset, y: point.y + yOffset}
                shape.setPoint(newPoint);
                shape.offset = {x:-shape.controlled.point.x + point.x + xOffset, y:-shape.controlled.point.y + point.y + yOffset};

                if (shape.pair && shape.joint === "symmetric") {
                  shape.pair.offset = {x:shape.controlled.point.x - point.x - xOffset, y:shape.controlled.point.y - point.y - yOffset}
                }
              }
            } else { //normal point
              context.solver.vars[xID] = point.x + (xOffset);
              context.solver.vars[yID] = point.y + (yOffset);
            }

          }

        }

      });

      context.updatePoints();
    }
  },

  up: (context) => {
    let point = context.state.svgMouse;

    let box = context.state.selectionBox;
    let xRange = box.x.sort((x,y) => x>y);
    let yRange = box.y.sort((x,y) => x>y);

    if (!context.state.dragging) {
      let nonPoints = [];
      let selectionTable = {};

      context.state.shapes.forEach(s => {
        if(s.shape === "point") {
          if (xRange[0] <= s.point.x && s.point.x <= xRange[1] && yRange[0] <= s.point.y && s.point.y <= yRange[1]) {
            // if (!s.coincident) { //TODO: Need to better handle overlapping points, really the constraint setting functions should handle it
            //   s.selectBoolean(true);
            // }
            s.selectBoolean(true);

            selectionTable[s.id] = s.selected;
          }
        } else {
          nonPoints.push(s);
        }
      })

      nonPoints.forEach(s => {
        if (s.pointList.every(p => selectionTable[p.id])) {
          s.selectBoolean(true);
        }
      })
    } else {//if we were dragging then unselect stuff now
      context.state.shapes.forEach(s => s.selected = false);
    }

    //let bool = context.state.shapes.some(shape => shape.select(point))
    let bool = context.state.shapes.every(shape => !shape.hover)
    let area = Math.abs(box.x[0] - box.x[1]) *  Math.abs(box.y[0] - box.y[1]);

    if (bool && area === 0) {
        context.state.shapes.forEach(shape => {
          shape.selectBoolean(false);
        })
    }

    context.setState({dragging:false})
  },
}

export {selectTool}
