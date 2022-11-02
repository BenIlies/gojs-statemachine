import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ManagerService } from '../manager.service';
import { HttpClient } from '@angular/common/http';
import {MatSelectModule} from '@angular/material/select';



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
    entries: [],
    loc: ""
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
      this.data.loc = this._selectedNode.data.loc;

      if(this.data.category == "event"){
        this.input_type = "events"
        // this.actions = this._selectedNode.data.events;
      }else{
        this.input_type = "entries"
        // this.actions = this._selectedNode.data.entries;

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
  public conditions = []
  public selectedActions = []

  public document: any;
  constructor(@Inject(DOCUMENT) document: Document, private ModelManager:ManagerService, private http: HttpClient) {
    this.document = document;

    this.ModelManager.model$.subscribe(
      data => {
        this.model = data
      });

      this.getJSON("../assets/attributes.json").subscribe((data)=>{
        this.actions = data['actions']
        this.conditions = data['conditions']

      })


   }


  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.ModelManager.model$.subscribe(
      data => {
        this.model = data
      });
  }

  onCommitForm(){
    console.log('form submitted baby')
    console.log(this.model.name)
    this.model.startTransaction();
    this.model.set(this.selectedNode.data, "name", this.data.name)
    this.model.set(this.selectedNode.data, "category", this.data.category)
    this.model.set(this.selectedNode.data, "events", this.selectedActions)
    this.model.set(this.selectedNode.data, "location", this.data.loc)
    this.model.set(this.selectedNode.data, "entries", this.data.entries)


    this.model.commitTransaction()
  }

//   addItem () {
//     this.data.entries.push({pid: this.document.getElementById("newItem").value, name: this.document.getElementById("newItem").value, condition: "condition:", target: "target"});
// }

  update_model(model: any){
    this.model = model
  }

  get_data(){
    return JSON.stringify(this.data, null, 2)
  }


  public getJSON(file: string): Observable<any> {
    return this.http.get(file);
  }

}
