import React from 'react';
import {ReactSVGPanZoom} from 'react-svg-pan-zoom';
import {ControlPoint, Point, Line, Arc, Bezier, Clone} from './shapes.js';
import {Solver} from './solver/solver.js';
import {handleKeyPress} from './userInputs/hotkeys.js';
import {functionAverageX, functionAverageY, clone} from './utils.js';
import {handleMouseUp, handleMouseDown, handleMouseMove} from './userInputs/mouseHandlers.js';
import {handleSave, handleUpload} from './saveUpload.js';
import * as mc from './constraints/editConstraints.js';

import './drawing.css';

class DrawArea extends React.Component {
  constructor() {
    super();

    this.state = {
      shapes: [], //will be a list of shapes
      mousedown: false,
      svgMouse: undefined,
      dragging: false,
      workpieceSize: {x:750, y:750},
      pivot: undefined,
      firstPoint: undefined,
      pivotID: undefined,
      constraints: [],
      hiddenConstraints: [],
      tool:"SELECT",
      isDrawing: false,
      mouseOver: false,
      lastClick: 0,
      satisfied: [],
      selectionBox:{x:[0,0], y:[0,0]},
      clipboard: [],
      constraintsClipboard: [],
      //originalShapes: [], //for transformations
      newShapes: [], //for transformations
      transformOperation: '', //for transformations
    };

    this.solver = new Solver();
  }

  updatePoints() {
    let c = this.state.constraints.reduce((acc, cur) => acc.concat(cur.getEqs()), []);
    let hc = this.state.hiddenConstraints.reduce((acc, cur) => acc.concat(cur.getEqs()), []); //Arc constraint here

    this.solver.eqs = c.concat(hc);//TODO: this is not a good method!

    this.state.constraints.forEach(constraint => {
      if (constraint.name === "coincident") {
        let [p1, p2] = constraint.points;
        if (p2.id !== p1.id) {p2.id = p1.id}
      }
    })

    // var t0 = performance.now();
    let satisfiedTemp = this.solver.solve() //solve updates vars in solver as well
    // var t1 = performance.now();
    // console.log(t1-t0, "ms")

    let satisfied = [];
    let count = 0;

    this.state.constraints.forEach((constraint, index) => {
      if (constraint.name === "coincident") {
        satisfied.push(true)
        count++
      } else {
        satisfied.push(satisfiedTemp[index-count])
      }
    })

    this.setState({satisfied});

    let sols = this.solver.vars;

    let controlPoints = [];
    let clones = [];

    this.state.shapes.forEach(shape => {

      if (shape instanceof ControlPoint && !shape.selected) {
        controlPoints.push(shape);
      }

      if (shape instanceof Clone && !shape.selected) {
        clones.push(shape);
      }

      if (shape.shape === "point" && !(shape instanceof ControlPoint) && !(shape instanceof Clone)) {
        let id = shape.id;
        let xID = `x${id}`;
        let yID = `y${id}`;

        let newPoint = {x:sols[xID], y:sols[yID]};

        shape.setPoint(newPoint);
      }
    })

    controlPoints.forEach(point => { //TODO: fix bug when offset goes to 0
      let p = point;
      let c = p.controlled;
      let newPoint = {x:c.point.x + p.offset.x, y:c.point.y + p.offset.y}

      p.setPoint(newPoint);
    })

    clones.forEach(point => { //TODO: fix bug when offset goes to 0
      let p = point;
      let c = p.progenitor.point;
      let theta = point.angle;
      // console.log(point.angle);
      // console.log("cos", Math.cos(theta))
      // console.log("sin", Math.sin(theta))

      let deltaX = (p.point.x - p.offset.x) - c.x;
      let deltaY = (p.point.y - p.offset.y) - c.y;

      let drx = p.scaleSigns[0]*(deltaX*Math.cos(theta) - deltaY*Math.sin(theta));
      let dry = p.scaleSigns[1]*deltaY*Math.cos(theta) + deltaX*Math.sin(theta);

      // console.log("x", deltaX, drx)
      // console.log("y", deltaY, dry)

      let x = (p.point.x) - drx; //*Math.cos(theta) + (c.point.y + p.offset.y)*Math.sin(theta);
      let y = (p.point.y) - dry; //*Math.cos(theta) + (c.point.x + p.offset.x)*Math.sin(theta);

      let newPoint = {x, y};

      p.setPoint(newPoint);
      p.offset = {x:newPoint.x - c.x, y:newPoint.y - c.y};
    })
  }

//------------------------------------------------
  updateSVGMouse(event) { //for tracking mouse position
    this.setState({
      svgMouse : {x:event.x, y:event.y}
    })
  }

  updateMouseOver(bool) { //for tracking mouse position
    this.setState({
      mouseOver : bool
    })
  }

  onClickTool(toolName) {
    if (toolName) {
      this.setState({
        tool: toolName,
      });
    } else {
      this.setState({
          tool: undefined,
      });
    }
  }

  makeClone(context) {
    let clones = clone(context);
    let clipboard = clones;
    let constraintsClipboard = [];

    context.setState({clipboard, constraintsClipboard});
  }

  handleDownload() { //downloads .svg of current drawing
    let filename = document.getElementById('name').value;
    if (filename === "") { filename = "noName"};
    filename = `${filename}.svg`;
    console.log(this.state.shapes);
    let shapes = this.state.shapes.filter(s => s.construction === false);

    let svgString = shapes.map(shape => {
      if (shape.shape !== "circle") {
        return `<path d="${shape.getPathData()}" stroke-linejoin="round" stroke-linecap="round" stroke-width="1px" stroke="black" fill="none"/>`;
      } else {
        return `<circle cx="${shape.pointList[0].point.x}" cy="${shape.pointList[0].point.y}" r="${shape.radius()}" stroke-linejoin="round" stroke-linecap="round" stroke-width="1px" stroke="black" fill="none"/>
`
      }
    });

    let text = `<svg
      width="${this.state.workpieceSize.x}"
      height="${this.state.workpieceSize.y}"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:svg="http://www.w3.org/2000/svg">
      ${svgString.join("")}
    </svg>`
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
  }

  setWorkpieceSize(e) { //sets dimensions of workpiece
    e.preventDefault();
    let width = parseFloat(document.getElementById('width').value, 10);
    let height = parseFloat(document.getElementById('height').value, 10);

    if (width > 0 && height > 0) {
      this.setState({
        workpieceSize : {x:width, y:height}
      })
    }
  }

  toggleConstruction() {
    let nonPoints = this.state.shapes.filter(s => s.shape !== "point");

    nonPoints.forEach(s => {
      if (s.selected) {
        s.construction = !s.construction;
      }
    });

    this.updatePoints();
  }

  // unhoverShapes() {
  //   if (this.state.tool !== "SELECT") {
  //     let shapes = this.state.shapes.map(s => {
  //       s.hover = false;
  //       return s;
  //     })
  //
  //     this.setState(shapes);
  //   } //this is a bit of a hack
  // }
  //
  // componentWillMount() {
  //   console.log("mounty")
  //   this.unhoverShapes();
  // }

  transformControls() {
    let points = this.state.shapes.filter(s => s.shape !== "point" && s.selected)
                                  .map(p => p.pointList)
                                  .reduce((a,b) => a.concat(b), [])
                                  .map(p => p.point);


    if (points.length > 1) {
      let averageX = points.reduce(functionAverageX);
      let averageY = points.reduce(functionAverageY);
      let pivot = {x:averageX, y:averageY};

      let firstPoint = this.state.svgMouse;

      return (
        <g>
          <polyline
            points={`${pivot.x+10},${pivot.y-15} ${pivot.x},${pivot.y-30} ${pivot.x-10},${pivot.y-15}`}
            className = {"controlArrow transformControl"}
            onMouseDown={() => this.setState({transformOperation:"moveY", pivot:this.state.svgMouse})}/>
          <polyline
            points={`${pivot.x+15},${pivot.y-10} ${pivot.x+30},${pivot.y} ${pivot.x+15},${pivot.y+10}`}
            className = {"controlArrow transformControl"}
            onMouseDown={() => this.setState({transformOperation:"moveX", pivot:this.state.svgMouse})}/>

          <circle
            cx={pivot.x}
            cy={pivot.y}
            r="5"
            fill={"orange"}
            className={"transformControl"}
            onMouseDown={() => this.setState({transformOperation:"move", pivot})}/>

            <path
              d={`M${pivot.x},${pivot.y-40} A60,60 0 0,1 ${pivot.x+40},${pivot.y}`}
              className={"transformControl rotateArrow"}
              onMouseDown={() => this.setState({transformOperation:"rotate", pivot, firstPoint})}/>
            <g
              className={"transformControl rotateArrow"}
              onMouseDown={() => this.setState({transformOperation:"scale", pivot, firstPoint})}>
              <circle
                cx={pivot.x - 25}
                cy={pivot.y + 25}
                r="5"
                fill="white"/>
              <path d={`M${pivot.x-10},${pivot.y+10} ${pivot.x-20},${pivot.y+20}`}/>
            </g>
            <g
              className={"transformControl rotateArrow"}
              onMouseDown={() => this.setState({transformOperation:"scaleX", pivot, firstPoint})}>
              <circle
                cx={pivot.x + 60}
                cy={pivot.y}
                r="5"
                fill="white"/>
              <path d={`M${pivot.x+40},${pivot.y} ${pivot.x+55},${pivot.y}`}/>
            </g>
            <g
              className={"transformControl rotateArrow"}
              onMouseDown={() => this.setState({transformOperation:"scaleY", pivot, firstPoint})}>
              <circle
                cx={pivot.x}
                cy={pivot.y - 60}
                r="5"
                fill="white"/>
              <path d={`M${pivot.x},${pivot.y-40} ${pivot.x},${pivot.y-55}`}/>
            </g>
        </g>
      )
    } else {
      return;
    }

  }

  render() {
    let pointer;
    switch (this.state.tool) { //tooltips
      case "POLYLINE":
        pointer = "crosshair";
        break;
      case "SELECT":
        pointer = "default";
        break;
      default:
        pointer = "default";
    }

    let activeStyle = {
      color: "blue",
    }

    let inactiveStyle = {
      color: "black",
    }

    let tool;
    switch (this.state.tool) {
      case "PAN":
        tool = "pan";
        break;
      default:
        tool = "none";
        break;
    }

    let sortedControlPoints = [];
    let sortedClones = [];
    let sortedRest = [];
    let sortedShapes = this.state.shapes.slice().sort((x, y) => (x.selected === y.selected) ? 0 : x.selected ? 1 : -1);
    sortedShapes.forEach(shape => {
      if (shape instanceof ControlPoint) {
        sortedControlPoints.push(shape);
      } else if (shape instanceof Clone) {
        sortedClones.push(shape);
      } else {
        sortedRest.push(shape);
      }
    })

    sortedControlPoints = sortedControlPoints.map((shape, index) => shape.svgRender(`shapes:${index}`));
    sortedClones = sortedClones.map((shape, index) => shape.svgRender(`clones:${index}`));
    sortedRest = sortedRest.map((shape, index) => shape.svgRender(`shapes:${index + sortedControlPoints.length}`));
    let newShapes = this.state.newShapes.map((shape, index) => shape.svgRender(`newShapes:${index}`));
    sortedShapes = sortedControlPoints.concat(sortedRest).concat(sortedClones).concat(newShapes);

    // console.log(sortedShapes);

    let unsatisfiedConstraints = this.state.constraints.filter((c, index) => !this.state.satisfied[index])

    let focusHere = document.getElementById("focusHere");

    function focus(context) {
      if (context.state.mouseOver) {focusHere.focus();}
    }

    if (focusHere) {
      focusHere.addEventListener(
        "focusout",
        focus(this),
        false
      );
    }

    //main render of program
    return (
      <div
        className={"grid"}
        >
        <div className={"fileBar"}>
          Name: <input type="text" id="name" name="name" style={{fontSize:14, width: "70px"}}/>
          <div className={"vl"}></div>
          <form>
            <div>
              <a className={"tools"} onClick={(e) => this.setWorkpieceSize(e)}>Workpiece Size (wxh):</a>
              &nbsp;
              <input type="text" id="width" name="width" style={{fontSize:14, width: "30px"}}/>
              x
              <input type="text" id="height" name="height" style={{fontSize:14, width: "30px"}}/>
            </div>
          </form>
          <div className={"vl"}></div>
          <form>
            <a className={"tools"} onClick={() => this.handleDownload()}>Download SVG</a>
          </form>
          <div className={"vl"}></div>
          <a className={"tools"} onClick={(e) => console.log("TODO")}>TODO: Undo</a>
          <div className={"vl"}></div>
          <a className={"tools"} onClick={(e) => console.log("TODO")}>TODO: Redo</a>
          <div className={"vl"}></div>
          <form>
            <a className={"tools"} onClick={() => handleSave(this)}>Save</a>
          </form>
          <div className={"vl"}></div>
          Upload: <input type="file" name="uploadedFile" onChange={(e) => handleUpload(this, e)}/>
        </div>
        <div
          className={"drawAreaStyle"}
          style = {{cursor: pointer}}
          id="focusHere"
          ref="drawArea"
          onMouseMove={(e) => handleMouseMove(e, this)}
          onMouseDown={(e) => handleMouseDown(e, this)}
          onMouseUp={(e) => handleMouseUp(e, this)}
          onMouseOut={()=>this.updateMouseOver(false)}
          onMouseOver={()=>this.updateMouseOver(true)}
          onKeyDown={(e) => this.state.mouseOver ? handleKeyPress(e, this) : console.log("ERROR OUT OF FOCUS (or at least mouseOver === false)")}
          tabIndex="1"
          >
          <ReactSVGPanZoom
            width={document.getElementById('focusHere') ? document.getElementById('focusHere').clientWidth : 0}
            height={document.getElementById('focusHere') ? document.getElementById('focusHere').clientHeight : 0}
            onMouseMove={event => this.updateSVGMouse(event)}
            toolbarPosition={"none"}
            miniaturePosition={"none"}
            detectAutoPan={false}
            tool={tool}
            >

              <svg
                width={this.state.workpieceSize.x}
                height={this.state.workpieceSize.y}
                >
                {!this.state.dragging && this.state.mousedown && this.state.tool === "SELECT" && <rect
                  x={this.state.selectionBox.x.slice().sort((x,y) => x>y)[0]}
                  y={this.state.selectionBox.y.slice().sort((x,y) => x>y)[0]}
                  width={Math.abs(this.state.selectionBox.x[0]-this.state.selectionBox.x[1])}
                  height={Math.abs(this.state.selectionBox.y[0]-this.state.selectionBox.y[1])}
                  style={{fill:"blue", opacity:.1}}
                />}
                {sortedShapes}
                {/*highlightedShapes*/}
                {this.state.tool === "TRANSFORM" && this.transformControls()}
              </svg>
          </ReactSVGPanZoom>
        </div>
        <div className={"constraints"}>
          <b>Constraints</b>
          {this.state.constraints.map((c, index) => c.targets.some(t => (t.selected || t.showConstraints) && this.state.tool !== "TRANSFORM") && <div className={"constraint"} key={`constraints:${index}`}>
            <a
              onMouseEnter={() => {
                c.targets.forEach(shape => shape.highlight = true)
                this.forceUpdate();
              }}
              onMouseLeave={() => {
                c.targets.forEach(shape => shape.highlight = false)
                this.forceUpdate();
              }}
              className={"c"}>
              {c.name} {c.angle && (90 - c.angle)}{c.dist} {!this.state.satisfied[index] && "!"}
            </a>

            <a
              onClick={() => mc.removeConstraint(index, this)}
              className={"x"}>
                x
            </a>
          </div>)}
          <div className={"unmetConstraints"}>
            <b>Unmet Constraints</b>
            {unsatisfiedConstraints.map((c, index) => (this.state.tool !== "TRANSFORM") && <div className={"constraint"} key={`constraints:${index}`}>
              <a
                onMouseEnter={() => {
                  c.targets.forEach(shape => shape.highlight = true)
                  this.forceUpdate();
                }}
                onMouseLeave={() => {
                  c.targets.forEach(shape => shape.highlight = false)
                  this.forceUpdate();
                }}
                className={"c"}>
                  {c.name} {c.angle && (90 - c.angle)}{c.dist}
              </a>

              <a
                onClick={() => mc.removeConstraint(index, this)}
                className={"x"}>
                  x
              </a>
            </div>)}
          </div>
        </div>
        <div
          className={"sidebar"}
          >
          <b>Tools</b><br/>
          <a className={"tools"} style={this.state.tool === "POLYLINE" ? activeStyle : inactiveStyle} onClick={(e) => this.onClickTool("POLYLINE")}>Polyline (L)</a><br/>
          <a className={"tools"} style={this.state.tool === "BEZIER" ? activeStyle : inactiveStyle} onClick={(e) => this.onClickTool("BEZIER")}>Bezier (B)</a><br/>
          <a className={"tools"} style={this.state.tool === "ARC" ? activeStyle : inactiveStyle} onClick={(e) => this.onClickTool("ARC")}>Arc (A)</a><br/>
          <a className={"tools"} style={this.state.tool === "RECTANGLE" ? activeStyle : inactiveStyle} onClick={(e) => this.onClickTool("RECTANGLE")}>Rectangle (R)</a><br/>
          <a className={"tools"} style={this.state.tool === "CIRCLE" ? activeStyle : inactiveStyle} onClick={(e) => this.onClickTool("CIRCLE")}>Circle (C)</a><br/>
          <a className={"tools"} style={this.state.tool === "POINT" ? activeStyle : inactiveStyle} onClick={(e) => this.onClickTool("POINT")}>Point (P)</a><br/>
          <a className={"tools"} style={this.state.tool === "TRANSFORM" ? activeStyle : inactiveStyle} onClick={(e) => this.onClickTool("TRANSFORM")}>Transform (T)</a><br/>
          <a className={"tools"} style={this.state.tool === "TRIM" ? activeStyle : inactiveStyle} onClick={(e) => this.onClickTool("TRIM")}>TODO: Trim (K)</a><br/>
          <a className={"tools"} style={this.state.tool === "SELECT" ? activeStyle : inactiveStyle} onClick={(e) => this.onClickTool("SELECT")}>Select (S)</a><br/>
          <a className={"tools"} style={this.state.tool === "PAN" ? activeStyle : inactiveStyle} onClick={(e) => this.onClickTool("PAN")}>Pan (H)</a><br/>
          <b>Operations</b><br/>
          <a className={"tools"} onClick={() => this.toggleConstruction()}>Construction</a><br/>
          <a className={"tools"} onClick={(e) => this.makeClone(this)}>Clone (CMD + X)</a><br/>
          <a className={"tools"} onClick={(e) => console.log("TODO")}>TODO: Fillet</a><br/>
          <a className={"tools"} onClick={() => console.log("TODO")}>TODO: Mirror</a><br/>
          <a className={"tools"} onClick={() => console.log("TODO")}>TODO: Offset</a><br/>
          <b>Parametric</b><br/>
          <a className={"tools"} onClick={() => mc.makeVertical(this)}>Vertical</a><br/>
          <a className={"tools"} onClick={() => mc.makeHorizontal(this)}>Horizontal</a><br/>
          <a className={"tools"} onClick={() => mc.makeCoincident(this)}>Coincident</a><br/>
          <a className={"tools"} onClick={() => mc.makeX(this)}>Set X</a><br/>
          <a className={"tools"} onClick={() => mc.makeY(this)}>Set Y</a><br/>
          <a className={"tools"} onClick={() => mc.makeFixed(this)}>Fix</a><br/>
          <a className={"tools"} onClick={() => mc.makeEqual(this)}>Equal</a><br/>
          <a className={"tools"} onClick={() => mc.makeParallel(this)}>Parallel</a><br/>
          <a className={"tools"} onClick={() => mc.makePerpendicular(this)}>Perpendicular</a><br/>
          <a className={"tools"} onClick={() => mc.makeAngle(this)}>Angle</a><input type="text" id="angle" style={{fontSize:14, width: "30px"}}/><br/>
          <a className={"tools"} onClick={() => mc.makeDistance(this)}>Distance</a><input type="text" id="length" style={{fontSize:14, width: "30px"}}/><br/>
          <a className={"tools"} onClick={() => mc.distancePL(this)}>Point and Line</a><input type="text" id="distPL" style={{fontSize:14, width: "30px"}}/><br/>
          <a className={"tools"} onClick={() => console.log("TODO")}>TODO: Midpoint</a><br/>
          <a className={"tools"} onClick={() => console.log("TODO")}>TODO: Tangent</a><br/>
        </div>

      </div>
    );
  }
}

export {DrawArea}
