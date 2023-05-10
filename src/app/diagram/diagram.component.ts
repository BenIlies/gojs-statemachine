import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as go from 'gojs';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ManagerService } from '../manager.service';


const $ = go.GraphObject.make;

// this function is used to parse functions from json format and display it
// in this format:  function_name (input1, input2, ...) (output1, output2, ...)
// keepting this funciton outside the component because of
// refrencing issues when called in gojs template
function flatten_function_args(action: any){
  let function_name = action['command']
  let input_pars = ""
  let output_pars = ""
  if (action['input_parm'].length >0 ){
    for (let parm of action['input_parm'] ){
      // console.log(parm)
      input_pars = input_pars+" "+ parm
    }
    input_pars = "(" +input_pars.trim() + ")"
  }
  if (action['output_parm'].length >0 ){
    for (let parm of action['output_parm'] ){
      output_pars = output_pars+" "+ parm
    }
    output_pars = "(" +output_pars.trim() + ")"
  }

  return function_name + " " + input_pars+" "+ output_pars
}


@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.css']
})
export class DiagramComponent implements OnInit {

  public diagram: go.Diagram;
  self = this;

  @Input()
  public model: go.Model | null = null;

  public set_model(model: any) {
    // these steps are important so when we copy to another model we don't
    // edit the same object
    model.copiesKey= false
    model.copiesArrayObjects = true;
    model.copiesArrays = true;
    this.diagram.model = model;
  }

  @Output()
  public nodeClicked = new EventEmitter();

  @Output()
  public modelChanges = new EventEmitter();

  public document: any;


  constructor(@Inject(DOCUMENT) document: Document,
    private http: HttpClient, private ModelManager: ManagerService) {
    this.document = document;
    this.ModelManager.model$.subscribe(
      data => {
        this.set_model(data)
      });

  }

  ngOnInit(): void {

  }


  // clicking the button inserts a new node to the right of the selected node,
  // and adds a link to that new node
  addNodeAndLink(e: any, obj: any) {
    var adornment = obj.part;
    var diagram = e.diagram;
    diagram.startTransaction("Add Event");

    // get the node data for which the user clicked the button
    var fromNode = adornment.adornedPart;
    var fromData = fromNode.data;
    // create a new "State" data object, positioned off to the right of the adorned Node
    let node_category = "state"
    let node_label = "New State"

    if (fromData.category == "state") {

      node_category = "event"
      node_label = "New Event"
    }
    var toData = { name: node_label, loc: "", category: node_category, events: [{ pid: "default", name: "defult", command: 'default', input_parm: [], input_args: 0, output_parm: [], output_args: 0, actions: [] }], entries: [], exit:[] };

    var p = fromNode.location.copy();
    p.x += 200;
    toData.loc = go.Point.stringify(p);  // the "loc" property is a string, not a Point object
    // add the new node data to the model
    var model = diagram.model;
    model.addNodeData(toData);

    // create a link data from the old node data to the new node data
    var linkdata = {
      from: model.getKeyForNodeData(fromData),  // or just: fromData.id
      to: model.getKeyForNodeData(toData),
      text: "transition"
    };
    // and add the link data to the model

    if (fromData.category == "state") {
      model.addLinkData(linkdata);
    }


    // select the new Node
    var newnode = diagram.findNodeForData(toData);
    diagram.select(newnode);

    diagram.commitTransaction("Add State");

    // if the new node is off-screen, scroll the diagram to show the new node
    diagram.scrollToRect(newnode.actualBounds);
  }

  removeNode(e: any, obj: any) {
    var adornment = obj.part;
    var diagram = e.diagram;
    diagram.startTransaction("remove node");

    // get the node data for which the user clicked the button
    var fromNode = adornment.adornedPart;
    var fromData = fromNode.data;


    // select the new Node
    var selectedNode = diagram.findNodeForData(fromData);
    diagram.remove(selectedNode);

    diagram.commitTransaction("Node removed");

  }



  // some constants that will be reused within templates
  roundedRectangleParams = {
    parameter1: 2,  // set the rounded corner
    spot1: go.Spot.TopLeft, spot2: go.Spot.BottomRight  // make content go all the way to inside edges of rounded corners
  };


  nodeTemplate =
    $(go.Panel, "Auto",
      $(go.Shape,
        {
          fill: "#fafdff",
          strokeWidth: 0.5,
          fromLinkable: true,
          fromLinkableDuplicates: true,
          fromSpot: go.Spot.LeftRightSides,
          cursor: "pointer",
        }
        ,
        new go.Binding("portId", "pid")
      ),
      $(go.TextBlock,
        {
          margin: new go.Margin(4, 4, 2, 4),
          isMultiline: false,
          editable: true
        },
        new go.Binding("text", "", function(data) {return flatten_function_args(data)})
      )

    );

  actionTemplate =
    $(go.Panel, "Auto",
      $(go.Shape,
        {
          fill: "#fafdff",
          strokeWidth: 0.5,
        }
      ),
      $(go.TextBlock,
        {
          margin: new go.Margin(4, 4, 2, 4),
          isMultiline: false,
          stroke: "black"
        },
        new go.Binding("text", "", function(data) {return flatten_function_args(data)})
      )
    );

  eventTemplate =
    $(go.Panel, "Auto",

      $(go.Panel, "Table",
        { minSize: new go.Size(150, NaN) },
        $(go.Panel, "Auto",
          { stretch: go.GraphObject.Horizontal },
          $(go.Shape,
            {
              // locationSpot: go.Spot.Top,
              fill: "#AE2012",
              fromLinkable: true,
              fromLinkableDuplicates: false,
              toMaxLinks: 1, fromMaxLinks: 1,
              fromSpot: go.Spot.LeftRightSides,
              cursor: "pointer",
            },
            new go.Binding("portId", "pid")
          ),
          $(go.TextBlock,
            {
              margin: new go.Margin(2, 4, 0, 4),
              stroke: "white",
              font: "bold 10pt sans-serif",
              isMultiline: false,
            },
            new go.Binding("text", "", function(data) {return flatten_function_args(data)})
          )
        ),

        $(go.Panel, "Vertical",
          {
            row: 1,
            stretch: go.GraphObject.Horizontal,
            defaultStretch: go.GraphObject.Horizontal,
            itemTemplate: this.actionTemplate
          },
          new go.Binding("itemArray", "actions", function (data) { if (Object.prototype.toString.call(data) === '[object Array]') return data; else return [data]; }),
        )
      )
    );

    entryTemplate =
    $(go.Panel, "Auto",
      $(go.Shape,
        {
          fill: "lightblue",
          strokeWidth: 0.5,
          fromLinkable: true,
          fromLinkableDuplicates: true,
          fromSpot: go.Spot.RightSide,
          cursor: "pointer"
        },
        new go.Binding("portId", "pid")
      ),
      $(go.TextBlock,
        {
          margin: new go.Margin(4, 4, 2, 4),
          isMultiline: false,
          editable: true
        },
        new go.Binding("text", "name").makeTwoWay()
      )
    );



  public ngAfterViewInit(): void {
    this.diagram = $(go.Diagram, 'myDiagramDiv',
      {
        "linkingTool.direction": go.LinkingTool.ForwardsOnly,
        "draggingTool.isGridSnapEnabled": true,
        "undoManager.isEnabled": true,
        layout: new go.LayeredDigraphLayout()
      });

    // only allow new links between ports of the same color
    this.diagram.toolManager.linkingTool.linkValidation = this.sameColor;

    // only allow reconnecting an existing link to a port of the same color
    this.diagram.toolManager.relinkingTool.linkValidation = this.sameColor;
    // making sure the copied nodes do not copy keys
    this.diagram.requestUpdate();

    let default_node_temp =
      $(go.Node, "Auto",
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        new go.Binding("BORDER.stroke", "isHighlighted", h => h ? "orange" : "black").ofObject(),
        $(go.Shape, { name: "BORDER", fill: null, strokeWidth: 2 },
          new go.Binding("stroke", "color")),
        $(go.Panel, "Table",
          { minSize: new go.Size(150, NaN) },
          $(go.Panel, "Auto",
            { stretch: go.GraphObject.Horizontal },
            $(go.Shape,
              {
                // locationSpot: go.Spot.Top,
                fill: "#001219",
                strokeWidth: 0.5,
                portId: "",
                toLinkable: true,
                fromLinkable: true,
                toLinkableDuplicates: false,
                fromLinkableDuplicates: false,
                // fromSpot: go.Spot.LeftRightSides,
                cursor: "pointer",
                // toSpot: go.Spot.LeftRightSides
              }),
            $(go.TextBlock,
              {
                margin: new go.Margin(2, 4, 0, 4),
                stroke: "white",
                font: "bold 10pt sans-serif",
                isMultiline: false,
                editable: true,
              },
              new go.Binding("text", "name").makeTwoWay())
          ),
          $(go.Panel, "Vertical",
          new go.Binding("visible", "entries", function(entries) { console.log(entries ); return entries.length > 0; }),
            {
              row: 1,
              stretch: go.GraphObject.Horizontal,
              defaultStretch: go.GraphObject.Horizontal,
            },
            $(go.Panel, "Auto",
              $(go.Shape,
                {
                  fill: "#0A9396",
                  strokeWidth: 0,
                }),
              $(go.TextBlock,
                {
                  text: "Entry Functions:",
                  stroke: "white",
                  margin: new go.Margin(4, 4, 2, 4),
                  isMultiline: false,
                  editable: false
                }
              )
            )
          ),
          $(go.Panel, "Vertical",
            {
              row: 2,
              stretch: go.GraphObject.Horizontal,
              defaultStretch: go.GraphObject.Horizontal,
              itemTemplate: this.nodeTemplate,

            },
            new go.Binding("itemArray", "entries"),
          ),
          $(go.Panel, "Vertical",
            {
              row: 3,
              stretch: go.GraphObject.Horizontal,
              defaultStretch: go.GraphObject.Horizontal,
            },
            $(go.Panel, "Auto",
              $(go.Shape,
                {
                  fill: "#94D2BD",
                  strokeWidth: 0,
                }),
              $(go.TextBlock,
                {
                  text: "Exit Functions:",
                  stroke: "black",
                  margin: new go.Margin(4, 4, 2, 4),
                  isMultiline: false,
                  editable: false
                }
              ),
            new go.Binding("visible", "exit", function(exit) { return exit.length > 0; })
            )
          ),
          $(go.Panel, "Vertical",
            {
              row: 4,
              stretch: go.GraphObject.Horizontal,
              defaultStretch: go.GraphObject.Horizontal,
              itemTemplate: this.nodeTemplate,

            },
            new go.Binding("itemArray", "exit"),
          )
        )
      );
    let event_node_temp =
      $(go.Node, "Auto", this.nodeStyle(),
        $(go.Shape, "RoundedRectangle", { stroke: "white", strokeWidth: 6, fill: null }),
        $(go.Panel, "Table",
          { minSize: new go.Size(150, NaN) },
          $(go.Panel, "Auto",
            { stretch: go.GraphObject.Horizontal },
            $(go.Shape,
              {
                fill: "#99a1ad",
                strokeWidth: 0.5,
                portId: "",
                toLinkable: true,
                toLinkableDuplicates: false,
                fromLinkableDuplicates: false,
                fromMaxLinks: 1,
                toSpot: go.Spot.LeftRightSides
              }),
            $(go.TextBlock,
              {
                margin: new go.Margin(2, 4, 0, 4),
                stroke: "black",
                font: "bold 10pt sans-serif",
                isMultiline: false,
                editable: true,
              },
              new go.Binding("text", "name").makeTwoWay())
          ),
          $(go.Panel, "Vertical",
            {
              row: 1,
              stretch: go.GraphObject.Horizontal,
              defaultStretch: go.GraphObject.Horizontal,
              itemTemplate: this.eventTemplate,

            },
            new go.Binding("itemArray", "events"),
          )
        )
      );


    // adding node button
    // unlike the normal selection Adornment, this one includes a Button
    var select_abn_temp =
      $(go.Adornment, "Spot",
        $(go.Panel, "Auto",
          $(go.Shape, "RoundedRectangle", this.roundedRectangleParams,
            { fill: null, stroke: "#7986cb", strokeWidth: 3 }),
          $(go.Placeholder)  // a Placeholder sizes itself to the selected Node
        ),
        // the button to create a "next" node, at the top-right corner
        $("Button",
          {
            alignment: go.Spot.TopRight,
            click: this.addNodeAndLink  // this function is defined below
          },
          $(go.Shape, "PlusLine", { width: 6, height: 6 })
        ), // end button
        $("Button",
          {
            alignment: go.Spot.TopLeft,
            click: this.removeNode  // this function is defined below
          },
          $(go.Shape, "MinusLine", { width: 6, height: 6 })
        ) // end button
      ); // end Adornment


    // create the nodeTemplateMap, holding three node templates:
    let templmap = new go.Map<string, go.Node>(); // In TypeScript you could write: new go.Map<string, go.Node>();
    // for each of the node categories, specify which template to use

    templmap.add("state", default_node_temp);
    templmap.add("event", event_node_temp);
    // for the default category, "", use the same template that Diagrams use by default;
    // this just shows the key value as a simple TextBlock
    default_node_temp.selectionAdornmentTemplate = select_abn_temp;
    event_node_temp.selectionAdornmentTemplate = select_abn_temp;
    templmap.add("", <go.Node>this.diagram.nodeTemplate);

    this.diagram.nodeTemplateMap = templmap;



    this.diagram.linkTemplate =
      $(go.Link,
        {
          fromEndSegmentLength: 30,
          toEndSegmentLength: 50,
          reshapable: true,
          relinkableFrom: true,
          relinkableTo: true,
          routing: go.Link.AvoidsNodes,
          // routing: go.Link.Orthogonal,  // may be either Orthogonal or AvoidsNodes
           curve: go.Link.JumpGap,
          corner: 10
        },
        // new go.Binding("toSpot", "fromNode", n => n.name === "Start" ? go.Spot.None : go.Spot.Default).ofObject(),
        $(go.Shape, { strokeWidth: 2 }),
        $(go.Shape, { toArrow: "Standard" })
      );

    if (this.diagram !== null) {

      this.diagram.model = this.ModelManager.model!;
    }

    // when the selection changes, emit event to app-component updating the selected node
    this.diagram.addDiagramListener('ChangedSelection', (e) => {
      if (this.diagram !== null) {
        const node = this.diagram.selection.first();
        this.nodeClicked.emit(node);
      }
    });

  }

  sameColor(fromnode: { data: { category: string; }; }, _fromport: any, tonode: { data: { category: string; }; }, toport: any) {
    return (fromnode.data.category == "state" && tonode.data.category == "event") || (fromnode.data.category == "event" && tonode.data.category == "state");
    // this could look at the fromport.fill and toport.fill instead,
    // assuming that the ports are Shapes, which they are because portID was set on them,
    // and that there is a data Binding on the Shape.fill
  }

  nodeStyle() {
    return [
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      new go.Binding("BORDER.stroke", "isHighlighted", h => h ? "orange" : "black").ofObject()
    ]
  }

  // Show the diagram's model in JSON format DEBUG purposes
  save() {
    if (this.diagram != null) {
      // console.log(this.diagram.model.toJson())
      this.document.getElementById("jsonViewer").value = this.ModelManager.to_json(this.diagram.model.toJson());
      this.diagram.isModified = false;
    }
  }
  // DEBUG purposes:
  saveGojs() {
    if (this.diagram != null) {
      // console.log(this.diagram.model.toJson())
      this.document.getElementById("gojsViewer").value = this.diagram.model.toJson();
      this.diagram.isModified = false;
    }
  }

 // loading from json viewer for  DEBUGGING too
  load() {
    if (this.diagram != null) {
      this.diagram.model = go.Model.fromJson(this.document.getElementById("jsonViewer").value);

    }
  }
  public getJSON(file: string): Observable<any> {
    return this.http.get(file);
  }


}

