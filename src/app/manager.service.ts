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
  private selectedNodeSource = new Subject<go.Node>();


  // Observable model streams
  model$ = this.selectedModelSource.asObservable();
  node$ = this.selectedNodeSource.asObservable();


  public model: go.GraphLinksModel;

  public model_list: go.GraphLinksModel[] = []

  public selectedNode: go.Node;

  constructor(private http: HttpClient) {

    this.model = new go.GraphLinksModel(
      {
        linkFromPortIdProperty: "pid",  // required information:
        // identifies data property names
        nodeDataArray: [
          { name: "START", category: "state", entries: [], exit: [], pid: "" },
        ],
        linkDataArray: [
          // no predeclared links
        ]
      }
    )
    this.announceModel(this.model)


    // this.model_list.push(this.model)
    // this.fromJson("../assets/example.json").subscribe((model) => { this.model_list.push(model) })
    // this.fromJson("../assets/m2.json").subscribe((model) => { this.model_list.push(model) })
    // this.fromJson("../assets/m3.json").subscribe((model) => { this.model_list.push(model) })
    // this.fromJson("../assets/m4.json").subscribe((model) => { this.model_list.push(model) })
    // this.fromJson("../assets/mainBK.json").subscribe((model) => { this.model_list.push(model) })
    this.fromJson("../assets/dns_request.json").subscribe((model) => { this.model_list.push(model) })


  }

  // Service message commands
  announceModel(model: go.GraphLinksModel) {
    this.selectedModelSource.next(model);
  }

  announceNode(node: go.Node) {
    this.selectedNodeSource.next(node);
  }

  selectModel(model: go.GraphLinksModel) {
    // this.model = model;
    this.announceModel(model)
  }

  selectNode(node: go.Node) {
    // this.model = model;
    this.announceNode(node)
  }


  to_json(model_data: any) {
    // return model_data
    model_data = JSON.parse(model_data)
    // let json_obj = {states: new Array<any>()}
    let json_obj = { states: {} }
    json_obj['id'] = model_data["name"]


    for (let item of model_data["nodeDataArray"]) {
      let entries = []
      let _exit = []
      if (item['category'] == 'state') {



        for (let e of item['entries']) {

          entries.push(e["name"])
        }
        for (let e of item['exit']) {

          _exit.push(e["name"])
        }
        json_obj.states[item['name']] = { entry: entries, exit: _exit, on: { locations: {} }, loc: item["loc"] }
      }
    }
    for (let item of model_data["nodeDataArray"]) {
      if (item['category'] == 'event') {
        json_obj.states[item['parent']]["on"][item['name']] = {}
        json_obj.states[item['parent']]["on"]["locations"][item['name']] = item["loc"]
      }
    }
    for (let item of model_data["linkDataArray"]) {
      if (json_obj.states[item['to']]) {
        if (item['pid'] == 'default') {
          json_obj.states[item['parent']]["on"][item['name']] = { target: item['to'], }
        } else {
          let source_node = this.model!.findNodeDataForKey(item['from'])
          let temp_cond = ""
          for (let e of source_node!['events']) {

            if (e!['pid'] == item['pid']) {
              temp_cond = e['name']
            }

          }

          if (Object.prototype.toString.call(json_obj.states[item['parent']]["on"][item['name']]) === '[object Array]') {
            json_obj.states[item['parent']]["on"][item['name']].push(
              { cond: temp_cond, target: item['to'], loc: item["loc"] }
            )
          }
          else {
            json_obj.states[item['parent']]["on"][item['name']] = [{ cond: temp_cond, target: item['to'] }]
          }

        }
      }

    }
    return JSON.stringify(json_obj);
  }

  public getJSON(file: string): Observable<any> {
    return this.http.get(file);
  }

  public fromJson(file: string): Observable<go.GraphLinksModel> {

    var self = this
    var mynodeDataArray: any = []
    var mynodeLinkArray: any = []
    var subject = new Subject<go.GraphLinksModel>();
    this.getJSON(file).subscribe(data => {
      let json_data = data['states']

      for (var key in json_data) {
        // parsing enrty
        let entries = []
        if (json_data[key]["entry"]) {
          if (Object.prototype.toString.call(json_data[key]["entry"]) === '[object Array]') {
            for (let e in json_data[key]["entry"]) {
              // extract the function and the attrib
              console.log(json_data[key]["entry"][e])
              let atrib = this.parse_function(json_data[key]["entry"][e])
              let command = atrib['command']
              let parm = atrib['parm']
              // for each action extract func and attrib

              entries.push({ name: command, command: command, parm: parm})
            }
          }
          else {
            // extract the function and the attrib
            let atrib = this.parse_function(json_data[key]["entry"]["entry"])
            let command = atrib['command']
            let parm = atrib['parm']

            entries.push({ name: command, command: command, parm: parm })
          }
        }

        // parsing exit
        let _exit = []
        if (json_data[key]["exit"]) {
          if (Object.prototype.toString.call(json_data[key]["exit"]) === '[object Array]') {
            for (let e in json_data[key]["exit"]) {
              // extract the function and the attrib

              let atrib = this.parse_function(json_data[key]["exit"][e])
              let command = atrib['command']
              let parm = atrib['parm']
              // for each action extract func and attrib

              _exit.push({ name: command, command: command, parm: parm})
            }
          }
          else {
            let atrib = this.parse_function(json_data[key]["exit"])
            let command = atrib['command']
            let parm = atrib['parm']
            // for each action extract func and attrib

            _exit.push({ name: command, command: command, parm: parm})
          }
        }

        let temp_node = { key: key, name: key, category: "state", entries: entries, exit: _exit, loc: json_data[key]["loc"] }
        mynodeDataArray.push(temp_node)


        for (var event in json_data[key]["on"]) {
          if (event == "locations") continue
          let _loc = null;
          if (json_data[key]["on"]["locations"]) {
            _loc = json_data[key]["on"]["locations"][event]
          }

          let temp_node = { key: key + '_' + event, name: event, category: "event", parent: key, events: new Array<any>(), entries: [], loc: _loc }
          let new_link = { "from": key, "to": key + '_' + event, "pid": "a" };
          // console.log(json_data[key]["on"][event])
          let conditions = json_data[key]["on"][event];
          if (Object.prototype.toString.call(conditions) === '[object Array]') {
            for (let cond of conditions) {
              // extract the function and the attrib
              let atrib = this.parse_function(cond['cond'])
              let condition = atrib['command']
              let parm = atrib['parm']
              // for each action extract func and attrib
              console.log(cond)

              console.log(cond['actions'])
              let _actions = this.parse_actions(cond['actions']) || [];
              console.log(_actions)
              temp_node.events.push({ pid: cond['cond'], name: condition, command: condition, parm: parm,  actions: _actions })
              let new_link = { "from": key + '_' + event, "to": cond['target'], "pid": cond['cond'], parent: key, name: event };
              mynodeLinkArray.push(new_link)
            }
          }
          else {
            // extract the function and the attrib
            // for each action extract func and attrib
            let _actions = this.parse_actions(conditions['actions']) || [];
            temp_node.events.push({ pid: "default", name: "defult", command: 'default', parm: [], actions: _actions })
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


      subject.next(self.model);
    });
    return subject.asObservable();
  }

  public load_static_file() {

    this.fromJson("../assets/example.json").subscribe((model => this.announceModel(model)))
  }

  public create_new_model(name: string) {
    this.model_list.push(new go.GraphLinksModel(
      {
        name: name,
        linkFromPortIdProperty: "pid",
        nodeDataArray: [
          { name: "START", category: "state", entries: [], exit: [] },
        ],
        linkDataArray: [
        ]
      }
    ))
  }

  parse_function(txt: string) {
    console.log("trying txt");
    console.log(txt)
    let init = txt.indexOf('(');

    let func = txt.substr(0, init - 1);
    let text = txt.substring(init - 1)
    init = text.indexOf('(');
    let parm = []
    let i = 0
    while (init>0) {
      i++
      console.log("trying txt");
      console.log(text)
      let fin = text.indexOf(')');
      parm.push((text.substr(init + 1, fin - init - 1)))

      text = text.substr(fin+1)
      console.log(text)
      if(txt){
        init = text.indexOf("(");
      }

      console.log(init)
    }
    return { command: func, parm: parm , input_args: i}
  }

  parse_actions(actions: any): any {

    let results = []
    if (typeof actions !== "undefined") {
      if (Object.prototype.toString.call(actions) === '[object Array]') {
        for (let a of actions) {
          results.push(this.parse_function(a))
        }
      }
      else{
        results.push(this.parse_function(actions))
      }
    }



    return results
  }

}
