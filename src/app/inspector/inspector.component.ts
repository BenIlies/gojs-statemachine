import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ManagerService } from '../manager.service';
import { HttpClient } from '@angular/common/http';
import { Model } from 'gojs';



@Component({
  selector: 'app-inspector',
  templateUrl: './inspector.component.html',
  styleUrls: ['./inspector.component.css']
})
export class InspectorComponent implements OnInit {

  public data: {
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

  public input_type = ""
  public show = false
  public model!: go.Model;
  public node!: go.Node;


  public actions = []
  public conditions = []
  public selectedActions = []

  public document: any;
  constructor(@Inject(DOCUMENT) document: Document, private ModelManager: ManagerService, private http: HttpClient) {
    this.document = document;

    this.ModelManager.model$.subscribe(
      data => {
        this.model = data
      });

       this.ModelManager.node$.subscribe(

      data => {
        // console.log(data)
        if (data == null) {
          this.show = false

        } else {
          this.show = true
          console.log(data)
          this.node = data
          this.data.name = this.node.data.name
          this.data.category = this.node.data.category
          this.data.events = Object.assign([], this.node.data.events); //deep copy otherwise it cuase issues
          this.data.entries = Object.assign([], this.node.data.entries);
          this.data.exit = Object.assign([], this.node.data.exit);
          this.data.loc = this.node.data.loc
          if (this.data.category == "event") {
            this.input_type = "event"
          }
          if (this.data.category == "state") {
            this.input_type = "entry action"

          }

        }
      });

  }


  ngOnInit(): void {

    // this.ModelManager.node$.subscribe(

    //   data => {
    //     // console.log(data)
    //     if (data == null) {
    //       this.show = false

    //     } else {
    //       this.show = true
    //       this.node = data
    //       this.data.name = this.node.data.name
    //       this.data.category = this.node.data.category
    //       this.data.events = Object.assign([], this.node.data.events); //deep copy otherwise it cuase issues
    //       this.data.entries = Object.assign([], this.node.data.entries);
    //       this.data.exit = Object.assign([], this.node.data.exit);
    //       this.data.loc = this.node.data.loc
    //       if (this.data.category == "event") {
    //         this.input_type = "event"
    //       }
    //       if (this.data.category == "state") {
    //         this.input_type = "entry action"

    //       }

    //     }
    //   });

    this.getJSON("../assets/attributes.json").subscribe((data) => {
      this.actions = data['actions']
      this.conditions = data['conditions']

    })
  }

  ngAfterViewInit(): void {


  }

  // this function updates the data model
  // with the values entered in the form and
  // saves the changes as a single transaction.
  onCommitForm() {

    this.model.startTransaction();
    this.model.set(this.node.data, "name", this.data.name)
    this.model.set(this.node.data, "category", this.data.category)
    // this.get_action_parm()
    this.model.set(this.node.data, "events", this.data.events)
    this.model.set(this.node.data, "location", this.data.loc)
    this.model.set(this.node.data, "entries", this.data.entries)
    this.model.set(this.node.data, "exit", this.data.exit)



    this.model.commitTransaction()
  }

  // get_action_parm() {
  //   for (let i = 0; i < this.data.events.length; i++) {
  //     console.log(this.data.events)
  //     for (let j = 0; j < this.data.events[i].parm.length; j++) {
  //       this.data.events[i] = this.data.events[i]["command"] + " (" + this.data.events[i]["parm"][j] + ") "
  //     }
  //   }
  // }

  //   addItem () {
  //     this.data.entries.push({pid: this.document.getElementById("newItem").value, name: this.document.getElementById("newItem").value, condition: "condition:", target: "target"});
  // }

  update_model(model: any) {
    this.model = model
  }

  get_data() {
    return JSON.stringify(this.data, null, 2)
  }


  public getJSON(file: string): Observable<any> {
    return this.http.get(file);
  }

  remove_item(key: number, list: Array<any>) {
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

  action_selected(action_selected: any) {
    let action = structuredClone(action_selected.value)
    console.log('length of actions:')
    console.log( this.data.entries)
    action["input_parm"] = new Array<string>(action['input_args']);
    action["output_parm"] = new Array<string>(action['output_args']);
    action["pid"] = this.data.name + action["command"]+ (this.data.entries.length +1).toString()

    this.data.entries.push(action)
  }



  action_selected_for_exit(action_selected: any) {
    let action = structuredClone(action_selected.value)
    action["input_parm"] = []
    action["output_parm"] = []
    action["pid"] = this.data.name + action["command"]

    this.data.exit.push( action)
  }

  condition_selected(cond_selected: any) {
    let cond = structuredClone(cond_selected.value)
    cond["actions"] = []
    cond["input_parm"] = []
    cond["output_parm"] = []
    cond["pid"] = this.data.name + cond["command"]+(this.data.events.length +1).toString()

    // console.log(cond['input_args'])

    this.data.events.push(cond)
  }

  event_action_selected(action_selected: any, i: number) {
    // console.log('selected event: ')
    // console.log(i)
    let action = structuredClone(action_selected.value)
    action["input_parm"] = []
    action["output_parm"] = []
    // console.log(action['input_args'])
    // for (let index = 0; index < parseInt(action['input_args']); index++) {
    //   // console.log("this shit is ..")
    //   action[index.toString()]= ""
    // }

    this.data.events[i].actions.push(action)
  }


}
