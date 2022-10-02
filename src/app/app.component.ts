import { Component } from '@angular/core';
import * as go from 'gojs'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-gojs';

  public selectedNode!: go.Node;
  public model: go.GraphLinksModel = new go.GraphLinksModel(
    {
      linkFromPortIdProperty: "pid",  // required information:
           // identifies data property names
      nodeDataArray: [
        { name: "START", category: "state", events: [{ pid: "a1", name: "listen", condition: "condition:", target: "target" }] },
        { name: "Event", category: "event", conditions: [{ pid: "a2", name: "wait", condition: "condition:", target: "target" }, { pid: "b2", name: "send", condition: "condition:", target: "target" }] },
        { name: "FINISH", category: "event", events: [{ pid: "a3", name: "send", condition: "condition:", target: "target" }], entries: [{ pid: "e1", name: "do_somthing", condition: "condition:", target: "target" }] },

      ],
      linkDataArray: [
        // no predeclared links
      ]
    }
  )

  public setSelectedNode(node: any) {
    this.selectedNode = node;
  }
}
