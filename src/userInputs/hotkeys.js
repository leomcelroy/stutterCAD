import * as mc from '../constraints/editConstraints.js'
import {ControlPoint, Point, Line, Bezier, Arc, Clone} from '../shapes.js';
import {copy, removeMissingConstraints, clone} from '../utils.js'

async function paste(context) { //pastes copied shapes, deselects old selection, selects newly pasted shapes
  let oldShapes = context.state.shapes;
  let copied = context.state.clipboard;
  let newShapes = [];

  oldShapes.forEach(shape => shape.selectBoolean(false))

  copied.forEach((shape) => {
    newShapes.push(shape);
  });

  newShapes = oldShapes.concat(newShapes);

  let oldC = context.state.constraints;
  let copiedC = context.state.constraintsClipboard;

  let constraints = oldC.concat(copiedC);

  context.setState({
    shapes:newShapes,
    clipboard:[],
    constraints,
    constraintsClipboard:[]
  });
}

async function handleKeyPress(e, context) {
  let code = (e.keyCode ? e.keyCode : e.which);
  console.log("key", code);

  let cmdDown = e.metaKey;

  let oldShapes = context.state.shapes;

  switch (code) {
    case 13: //enter
      switch (context.state.tool) {
        //add select case here
        case "BEZIER":
          let beziers = context.state.shapes.filter(shape => shape.shape === "bezier");
          let lastBezier = beziers[beziers.length - 1];
          let l = (beziers.length > 0) ? lastBezier.pointList.length : undefined;

          if (l) {lastBezier.pointList[l-4].controlPoints.forEach(p => p.visible = false);}

          context.setState({
            isDrawing:false,
          })
          break;
        case "POLYLINE":
            context.setState({
              isDrawing:false,
            })
          break;
        default:
          return;
      }
      break;
    case 27: //esc
      switch (context.state.tool) {
        case "POLYLINE":
            if (context.state.isDrawing === true) {
              let newShapes = oldShapes.slice(0, oldShapes.length - 3);
              let constraints = removeMissingConstraints(newShapes, context.state.constraints);
              context.setState({
                isDrawing:false,
                shapes:newShapes,
                constraints,
              })
            }
          break;
        case "BEZIER":
            if (context.state.isDrawing === true) {
              let newShapes = oldShapes.slice(0, oldShapes.length - 3); //TODO: context number changes
              let constraints = removeMissingConstraints(newShapes, context.state.constraints);
              context.setState({
                isDrawing:false,
                shapes:newShapes,
                constraints,
              })
            }
          break;
        default:
          return;
      }
      break;
    case 80: //p
      context.setState({tool:"POINT"})
      break;
    case 76: //p
      context.setState({tool:"POLYLINE"})
      break;
    case 65: //a
      context.setState({tool:"ARC"})
      break;
    case 83: //s
      context.setState({tool:"SELECT"})
      break;
    case 72: //h
      context.setState({tool:"PAN"})
      break;
    case 8: //delete
      let unselectedShapes = [];
      let selectedShapes = [];


      let clones = context.state.shapes.filter(s => s instanceof Clone);
      clones.forEach(c => {
        if (c.progenitor.selected) {
          c.selectBoolean(true);
        }
      })

      context.state.shapes.forEach(s => { //remove lines with missing points
        if (s.shape !== "point") {
          let remove = s.pointList.some(point => point.selected);
          if (remove) {
            s.selectBoolean(true);
            s.pointList.forEach(p => p.selectBoolean(true));
          }
        }
      })

      context.state.shapes.forEach(shape => {

        if (shape instanceof ControlPoint) {
          if (shape.controlled.selected) {
            selectedShapes.push(shape);
          } else {
            unselectedShapes.push(shape);
          }
        } else if (shape.selected === false) {
          unselectedShapes.push(shape);
        } else {
          selectedShapes.push(shape);
        }
      })

      let hiddenConstraints = removeMissingConstraints(unselectedShapes, context.state.hiddenConstraints);
      let constraints = removeMissingConstraints(unselectedShapes, context.state.constraints);

      context.setState({
        hiddenConstraints,
        constraints,
        shapes: unselectedShapes,
      });

      break;
    case 84: //t
      context.setState({tool:"TRANSFORM"});
      break;
    case 88: //x: cloning or duplicating
      if (cmdDown === true) {
        let clones = clone(context);
        let clipboard = clones;
        let constraintsClipboard = [];

        context.setState({clipboard, constraintsClipboard});
      }
      break;
    case 67: //c
     if (cmdDown === true) {
       let copies = copy(context);
       let clipboard = copies[0];
       let constraintsClipboard = copies[1];

       context.setState({clipboard, constraintsClipboard});
     } else {
       context.setState({tool:"CIRCLE"});
     }
     break;
   case 86: //v
     if (cmdDown === true) {
       await paste(context);
       context.updatePoints();
     }
     break;
    case 82: //r: reset
      context.setState({tool:"RECTANGLE"});
      break;
    case 66: //b: run resolve timer
      context.setState({tool:"BEZIER"});
      break;
    case 16: //shift
      let pairChanged = [];
      context.state.shapes.forEach(s => {
        //if(s instanceof ControlPoint && s.select(context.state.svgMouse) && pairChanged.indexOf(s) === -1){
        if(s instanceof ControlPoint && pairChanged.indexOf(s) === -1 && s.overPoint(context.state.svgMouse)){
          let newJoint = (s.joint === "symmetric") ? "disconnected" : "symmetric";
          if (s.controlled.controlPoints.length > 0) {
            s.controlled.controlPoints.forEach(p => {
              p.joint = newJoint;
              pairChanged.push(p)
            })
          } else { //for closed bezier
            s.joint = newJoint;
            s.pair.joint = newJoint;
            pairChanged.push(s);
            pairChanged.push(s.pair);
          }
        }
      })
      break;
    default:
      return;
  }

  // let hovered = document.querySelectorAll( ":hover" );
  // if (hovered.length <= 10 || context.state.tool !== "SELECT" && oldShapes.filter(s => s.hover).length >= 1) {
  //   console.log(oldShapes.filter(s => s.hover))
  //   let newShapes = oldShapes.map(s => {
  //     s.hover = false;
  //     return s;
  //   });
  //
  //   context.setState({shapes:newShapes});
  // }
}

export {handleKeyPress}
