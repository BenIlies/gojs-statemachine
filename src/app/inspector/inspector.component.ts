import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-inspector',
  templateUrl: './inspector.component.html',
  styleUrls: ['./inspector.component.css']
})
export class InspectorComponent implements OnInit {

  @Input()
  public data = {
    name: null,
    type: "state",
    events: [],
    entries: []
  }
  @Input()
  public model!: go.Model;
  @Input()
  public _selectedNode!: any;
  @Input()
  get selectedNode() { return this._selectedNode;}
  set selectedNode(node: go.Node){
    if (node){
      this._selectedNode = node;
      this.data.name = this._selectedNode.data.name;
      this.data.events = this._selectedNode.data.events;
      this.data.entries = this._selectedNode.data.entries;
    } else {
      this._selectedNode = null
    }
  }

  public actions = [
    {pid: "e", name: "SEND_ACK", condition: "condition:", target: "target"},
    {pid: "ar", name: "SEND_SYN", condition: "condition:", target: "target"},
    {pid: "aw", name: "LISTEN", condition: "condition:", target: "target"},
    {pid: "aq", name: "SET_TIMEOUT", condition: "condition:", target: "target"}
  ]
  public selectedActions = []
  constructor() {

   }

  ngOnInit(): void {
  }

  onCommitForm(){
    console.log('form submitted baby')
    this.model.startTransaction();
    this.model.set(this.selectedNode.data, "name", this.data.name)
    this.model.set(this.selectedNode.data, "events", this.selectedActions)
    this.model.commitTransaction()
  }

}
