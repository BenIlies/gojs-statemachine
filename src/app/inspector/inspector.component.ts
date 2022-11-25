import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ManagerService } from '../manager.service';
import { HttpClient } from '@angular/common/http';



@Component({
  selector: 'app-inspector',
  templateUrl: './inspector.component.html',
  styleUrls: ['./inspector.component.css']
})
export class InspectorComponent implements OnInit {

  public data : {
    name: null,
    category: string,
    events: any[],
    entries: any[],
    exit: any[],
    loc: string
  } = {
    name: null,
    category: "state",
    events: [],
    entries: [],
    exit: [],
    loc: ""
  }

  public input_type= ""
  public show =false
  public model!: go.Model;
  public node!: go.Node;


  public actions = []
  public conditions = []
  public selectedActions = []

  public document: any;
  constructor(@Inject(DOCUMENT) document: Document, private ModelManager:ManagerService, private http: HttpClient) {
    this.document = document;

    this.ModelManager.model$.subscribe(
      data => {
        this.model = data
      });

   }


  ngOnInit(): void {


      this.ModelManager.node$.subscribe(

        data => {
          console.log(data)
          if (data == null){
            this.show = false

          }else{
            this.show = true
            this.node = data
            this.data.name = this.node.data.name
            this.data.category= this.node.data.category
            this.data.events= Object.assign([], this.node.data.events); //deep copy otherwise it cuase issues
            this.data.entries= Object.assign([], this.node.data.entries);
            this.data.exit= Object.assign([], this.node.data.exit);
            this.data.loc= this.node.data.loc
            if (this.data.category=="event"){
              this.input_type = "event"
            }
            if (this.data.category=="state"){
              this.input_type = "entry action"

            }

          }
        });

    this.getJSON("../assets/attributes.json").subscribe((data)=>{
      this.actions = data['actions']
      this.conditions = data['conditions']

    })
  }

  ngAfterViewInit(): void {


  }

  onCommitForm(){

    this.model.startTransaction();
    this.model.set(this.node.data, "name", this.data.name)
    this.model.set(this.node.data, "category", this.data.category)
    this.model.set(this.node.data, "events", this.data.events)
    this.model.set(this.node.data, "location", this.data.loc)
    this.model.set(this.node.data, "entries", this.data.entries)


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

  remove_item(key: number, list: Array<any>){
    list.splice(key, 1)
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
      this.data = {
      name: null,
      category: "state",
      events: [],
      entries: [],
      exit: [],
      loc: ""
    }
  }

  action_selected(action_selected: any){

    this.data.entries.push({"name": action_selected.value})
  }

  condition_selected(cond_selected: any){

    this.data.events.push({"name": cond_selected.value, actions: [], pid: this.data.name+cond_selected.value})
  }

  event_action_selected(action_selected: any, i:number ){
    // console.log
    this.data.events[i].actions.push(action_selected.value)
  }

}
