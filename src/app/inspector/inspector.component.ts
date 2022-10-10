import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-inspector',
  templateUrl: './inspector.component.html',
  styleUrls: ['./inspector.component.css']
})
export class InspectorComponent implements OnInit {

  @Input()
  public data = {
    name: null,
    category: "state",
    events: [],
    entries: []
  }

  public input_type= ""
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
      this.data.category = this._selectedNode.data.category;
      if(this.data.category == "event"){
        this.input_type = "events"
      }else{
        this.input_type = "entries"
      }
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

  public document: any;
  constructor(@Inject(DOCUMENT) document: Document) {
    this.document = document;
   }


  ngOnInit(): void {

  }

  onCommitForm(){
    console.log('form submitted baby')
    this.model.startTransaction();
    this.model.set(this.selectedNode.data, "name", this.data.name)
    this.model.set(this.selectedNode.data, "category", this.data.category)
    this.model.set(this.selectedNode.data, "events", this.selectedActions)
    this.model.set(this.selectedNode.data, "entries", this.selectedActions)
    this.model.set(this.selectedNode.data, "events", this.selectedActions)
    this.model.commitTransaction()
  }

  addItem () {
    this.actions.push({pid: this.document.getElementById("newItem").value, name: this.document.getElementById("newItem").value, condition: "condition:", target: "target"});
}

  update_model(model: any){
    this.model = model
  }

}
