import { Injectable } from '@angular/core';
import * as go from 'gojs';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

const $ = go.GraphObject.make;


@Injectable({
  providedIn: 'root'
})
export class ManagerService {

  // Observable model sources
  private selectedModelSource = new Subject<go.GraphLinksModel>();

  // Observable model streams
  model$ = this.selectedModelSource.asObservable();

  public model: go.GraphLinksModel;

  public model_list: go.GraphLinksModel[] = []

  constructor(private http: HttpClient) {

    this.model = new go.GraphLinksModel(
      {
        linkFromPortIdProperty: "pid",  // required information:
        // identifies data property names
        nodeDataArray: [
          { name: "START", category: "state", events: [{ pid: "a1", name: "listen", condition: "condition:", target: "target" }] },
          // { name: "Event", category: "event", conditions: [{ pid: "a2", name: "wait", condition: "condition:", target: "target" }, { pid: "b2", name: "send", condition: "condition:", target: "target" }] },
          // { name: "FINISH", category: "event", events: [{ pid: "a3", name: "send", condition: "condition:", target: "target" }], entries: [{ pid: "e1", name: "do_somthing", condition: "condition:", target: "target" }] },

        ],
        linkDataArray: [
          // no predeclared links
        ]
      }
    )

    this.model_list.push(this.model)
    this.fromJson("../assets/example.json").subscribe((model) => {this.model_list.push(model)})
    this.fromJson("../assets/m2.json").subscribe((model) => {this.model_list.push(model)})
    this.fromJson("../assets/m3.json").subscribe((model) => {this.model_list.push(model)})
    this.fromJson("../assets/mainBK.json").subscribe((model) => {this.model_list.push(model)})


  }

    // Service message commands
    announceModel(model: go.GraphLinksModel) {
      this.selectedModelSource.next(model);
    }

    selectModel(model: go.GraphLinksModel){
      console.log('selecting model')
      console.log(model.toJson())

      // this.model = model;
      this.announceModel(model)
    }
  // load() {
  //   if (this.diagram != null) {
  //     this.diagram.model = go.Model.fromJson(this.document.getElementById("jsonViewer").value);

  //   }
  // }

  to_json(model_data: any) {
    // return model_data
    model_data = JSON.parse(model_data)
    // let json_obj = {states: new Array<any>()}
    let json_obj = { states: {} }
    json_obj['id'] = model_data["name"]


    for (let item of model_data["nodeDataArray"]) {
      let entries = []
      if (item['category'] == 'state') {

        console.log("entriees")

        for (let e of item['entries']) {
          console.log(e['name'])

          entries.push(e["name"])
        }
        json_obj.states[item['name']] = { entry: entries, on: {locations: {}} , loc: item["loc"]}
      }
    }
    for (let item of model_data["nodeDataArray"]) {
      if (item['category'] == 'event') {
        json_obj.states[item['parent']]["on"][item['name']] = {}
        json_obj.states[item['parent']]["on"]["locations"][item['name']]= item["loc"]
      }
    }
    for (let item of model_data["linkDataArray"]) {
      if (json_obj.states[item['to']]) {
        if (item['pid'] == 'default') {
          json_obj.states[item['parent']]["on"][item['name']] = { target: item['to'],  }
        } else {
          let source_node = this.model!.findNodeDataForKey(item['from'])
          console.log("source_node")
          let temp_cond = ""
          for (let e of source_node!['events']) {
            console.log(e)

            if (e!['pid'] == item['pid']) {
              temp_cond = e['name']
            }

          }
          if (Object.prototype.toString.call(json_obj.states[item['parent']]["on"][item['name']]) === '[object Array]') {
            json_obj.states[item['parent']]["on"][item['name']].push(
              { cond: temp_cond, target: item['to'],  loc: item["loc"]}
            )
          }
          else {
            json_obj.states[item['parent']]["on"][item['name']] = [{ cond: temp_cond, target: item['to']}]
          }

        }
      }

    }
    return JSON.stringify(json_obj, null, 2);
  }

  public getJSON(file: string): Observable<any> {
    return this.http.get(file);
  }

  public fromJson(file: string): Observable<go.GraphLinksModel>{

    console.log('setting model form json')
    var self = this
    var mynodeDataArray: any = []
    var mynodeLinkArray: any = []
    var subject = new Subject<go.GraphLinksModel>();
    this.getJSON(file).subscribe(data => {
      // console.log(data);
      let json_data = data['states']

      for (var key in json_data) {

        let entries = []
        if (Object.prototype.toString.call(json_data[key]["entry"]) === '[object Array]') {
          for (let e in json_data[key]["entry"]) {
            entries.push({ name: json_data[key]["entry"][e] })
          }
        }
        else {
          entries.push({ name: json_data[key]["entry"] })
        }

        let temp_node = { key: key, name: key, category: "state", entries: entries, loc: json_data[key]["loc"]}
        mynodeDataArray.push(temp_node)

        for (var event in json_data[key]["on"]) {
          if(event =="locations") continue
          let _loc = null;
          if (json_data[key]["on"]["locations"]){
            _loc = json_data[key]["on"]["locations"][event]
          }
          let temp_node = { key: key + '_' + event, name: event, category: "event", parent: key, events: new Array<any>(), entries: [], loc: _loc}
          let new_link = { "from": key, "to": key + '_' + event, "pid": "a" };
          // console.log(json_data[key]["on"][event])
          let conditions = json_data[key]["on"][event];
          if (Object.prototype.toString.call(conditions) === '[object Array]') {
            for (let cond of conditions) {
              temp_node.events.push({ pid: cond['cond'], name: cond['cond'], actions: cond['actions'] })
              let new_link = { "from": key + '_' + event, "to": cond['target'], "pid": cond['cond'], parent: key, name: event };
              mynodeLinkArray.push(new_link)
            }
          }
          else {
            temp_node.events.push({ pid: "default", name: "defult", actions: conditions['actions']})
            let new_link = { "from": key + '_' + event, "to": conditions['target'], "pid": "default", parent: key, name: event };
            mynodeLinkArray.push(new_link)
          }

          mynodeLinkArray.push(new_link)
          mynodeDataArray.push(temp_node)


        }
      }


      self.model = new go.GraphLinksModel(
        {
          name: data["id"],
          linkFromPortIdProperty: "pid",  // required information:
          // identifies data property names
          nodeDataArray: mynodeDataArray,
          linkDataArray: mynodeLinkArray
        }
      );
      console.log("temp_model")
      console.log(self.model.toJson())

      subject.next(self.model);
    });
    return subject.asObservable();
  }

  public load_static_file(){

    this.fromJson("../assets/example.json").subscribe((model=>  this.announceModel(model)))
  }

  public create_new_model(name:string){
    this.model_list.push(new go.GraphLinksModel(
      {
        name: name,
        linkFromPortIdProperty: "pid",
        nodeDataArray: [
          { name: "START", category: "state", },
        ],
        linkDataArray: [
        ]
      }
    ))
  }

}
