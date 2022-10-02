import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as go from 'gojs';
import { DOCUMENT } from '@angular/common';


const $ = go.GraphObject.make;

const entryTemplate =
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
      new go.Binding("text", "name").makeTwoWay())
  );



@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.css']
})
export class DiagramComponent implements OnInit {

  public diagram: go.Diagram | null = null;

  @Input()
  public model: go.Model | null = null;

  @Output()
  public nodeClicked = new EventEmitter();

  public document: any;


  constructor(@Inject(DOCUMENT) document: Document) {
    this.document = document;

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
    let node_category  = "state"
    let node_label = "New State"
    if (fromData.category == "state" ){

       node_category = "event"
       node_label =  "New Event"
    }
    var toData = { name: node_label, loc: "", category: node_category };
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

  // some constants that will be reused within templates
  roundedRectangleParams = {
    parameter1: 2,  // set the rounded corner
    spot1: go.Spot.TopLeft, spot2: go.Spot.BottomRight  // make content go all the way to inside edges of rounded corners
  };


  eventTemplate =
    $(go.Panel, "Auto",
      $(go.Shape,
        {
          fill: "#BDDDD8",
          strokeWidth: 0.5,
          fromLinkable: true,
          fromLinkableDuplicates: true,
          fromSpot: go.Spot.LeftRightSides,
          cursor: "pointer",
        }
        ,
        new go.Binding("portId", "pid")
      )
      ,
      $(go.TextBlock,
        {
          margin: new go.Margin(4, 4, 2, 4),
          isMultiline: false,
          editable: true
        },
        new go.Binding("text", "name").makeTwoWay())


    );

  public ngAfterViewInit(): void {
    this.diagram = $(go.Diagram, 'myDiagramDiv',
      {
        "linkingTool.direction": go.LinkingTool.ForwardsOnly,
        "draggingTool.isGridSnapEnabled": true,
        "undoManager.isEnabled": true
      });

    // only allow new links between ports of the same color
    this.diagram.toolManager.linkingTool.linkValidation = this.sameColor;

    // only allow reconnecting an existing link to a port of the same color
    this.diagram.toolManager.relinkingTool.linkValidation = this.sameColor;


    let default_node_temp =
      $(go.Node, "Auto", this.nodeStyle(),
        $(go.Shape, { name: "BORDER", fill: null, strokeWidth: 2 },
          new go.Binding("stroke", "color")),
        $(go.Panel, "Table",
          { minSize: new go.Size(150, NaN) },
          $(go.Panel, "Auto",
            { stretch: go.GraphObject.Horizontal },
            $(go.Shape,
              {
                fill: "#db5461",
                strokeWidth: 0.5,
                portId: "",
                toLinkable: true,
                toLinkableDuplicates: true,
                // fromLinkableDuplicates: true,
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
        ) // end button
      ); // end Adornment


    let event_node_temp =
      $(go.Node, "Auto", this.nodeStyle(),
        $(go.Shape, "RoundedRectangle", { stroke: "white", strokeWidth: 6, fill: null }),
        $(go.Panel, "Table",
          { minSize: new go.Size(150, NaN) },
          $(go.Panel, "Auto",
            { stretch: go.GraphObject.Horizontal },
            $(go.Shape,
              {
                fill: "#db5481",
                strokeWidth: 0.5,
                portId: "",
                toSpot: go.Spot.LeftRightSides
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
          curve: go.Link.Bezier,
          fromEndSegmentLength: 30,
          toEndSegmentLength: 50,
          reshapable: true,
          relinkableFrom: true,
          relinkableTo: true
        },
        // new go.Binding("toSpot", "fromNode", n => n.name === "Start" ? go.Spot.None : go.Spot.Default).ofObject(),
        $(go.Shape, { strokeWidth: 2 }),
        $(go.Shape, { toArrow: "Standard" })
      );
    //  // define the Node template
    //  this.diagram.nodeTemplate =
    //  $(go.Node, 'Auto',
    //    // for sorting, have the Node.text be the data.name
    //    new go.Binding('text', 'name'),
    //    // bind the Part.layerName to control the Node's layer depending on whether it isSelected
    //    new go.Binding('layerName', 'isSelected', function(sel) { return sel ? 'Foreground' : ''; }).ofObject(),
    //    // define the node's outer shape
    //    $(go.Shape, 'Rectangle',
    //      {
    //        name: 'SHAPE', fill: 'lightblue', stroke: null,
    //        // set the port properties:
    //        portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer'
    //      },
    //      new go.Binding('fill', '', function(node) {
    //        // modify the fill based on the tree depth level
    //        const levelColors = ['#AC193D', '#2672EC', '#8C0095', '#5133AB',
    //          '#008299', '#D24726', '#008A00', '#094AB2'];
    //        let color = node.findObject('SHAPE').fill;
    //        const dia: go.Diagram = node.diagram;

    //        return color;
    //      }).ofObject()
    //    ),
    //    $(go.Panel, 'Horizontal',
    //      $(go.Picture,
    //        {
    //          name: 'Picture',
    //          desiredSize: new go.Size(39, 50),
    //          margin: new go.Margin(6, 8, 6, 10)
    //        },
    //        new go.Binding('source', 'key', function(key) {
    //          if (key < 0 || key > 16) return ''; // There are only 16 images on the server
    //          return 'assets/HS' + key + '.png';
    //        })
    //      ),
    //      // define the panel where the text will appear
    //      $(go.Panel, 'Table',
    //        {
    //          maxSize: new go.Size(150, 999),
    //          margin: new go.Margin(6, 10, 0, 3),
    //          defaultAlignment: go.Spot.Left
    //        },
    //        $(go.RowColumnDefinition, { column: 2, width: 4 }),
    //        $(go.TextBlock, { font: '9pt  Segoe UI,sans-serif', stroke: 'white' },  // the name
    //          {
    //            row: 0, column: 0, columnSpan: 5,
    //            font: '12pt Segoe UI,sans-serif',
    //            editable: true, isMultiline: false,
    //            minSize: new go.Size(10, 16)
    //          },
    //          new go.Binding('text', 'name').makeTwoWay()),
    //        $(go.TextBlock, 'type: ', { font: '9pt  Segoe UI,sans-serif', stroke: 'white' },
    //          { row: 1, column: 0 }),
    //        $(go.TextBlock, { font: '9pt  Segoe UI,sans-serif', stroke: 'white' },
    //          {
    //            row: 1, column: 1, columnSpan: 4,
    //            editable: true, isMultiline: false,
    //            minSize: new go.Size(10, 14),
    //            margin: new go.Margin(0, 0, 0, 3)
    //          },
    //          new go.Binding('text', 'type').makeTwoWay()),
    //        $(go.TextBlock, { font: '9pt  Segoe UI,sans-serif', stroke: 'white' },
    //          { row: 2, column: 0 },
    //          new go.Binding('text', 'key', function(v) { return 'ID: ' + v; })),

    //      )  // end Table Panel
    //    ) // end Horizontal Panel
    //  );  // end Node


    if (this.diagram !== null) {
      this.diagram.model = this.model!;
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

  // Show the diagram's model in JSON format
  save() {
    if (this.diagram != null) {
      console.log(this.diagram.model.toJson())
      this.document.getElementById("jsonViewer").value = this.diagram.model.toJson();
      this.diagram.isModified = false;
    }

  }
  load() {
    if (this.diagram != null) {
      this.diagram.model = go.Model.fromJson(this.document.getElementById("jsonViewer").value);

    }

  }







}