import { Component, ViewChild } from '@angular/core';
import * as go from 'gojs'
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DiagramComponent } from './diagram/diagram.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  status: boolean = false;
  clickEvent(){
      this.status = !this.status;
  }

  title = 'angular-gojs';

  @ViewChild('diagram') diagram:DiagramComponent;

  public selectedNode!: go.Node;
  public model: go.GraphLinksModel = new go.GraphLinksModel(
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


  constructor(private http: HttpClient) {

  }

  ngAfterViewInit() {
    // child is set
    // this.fromJson()
  }



  public setSelectedNode(node: any) {
    this.selectedNode = node;
  }

  setModel(model:any){
    this.model = model;
  }

  public getJSON(file: string): Observable<any> {
    return this.http.get(file);
  }

  public fromJson() {
    var mynodeDataArray:any = []
    var mynodeLinkArray:any = []
    this.getJSON("../assets/example.json").subscribe(data => {
      // console.log(data);
      let json_data = data['states']

      for (var key in json_data) {
        // json_node =
        // console.log(key)
        let temp_node = { key: key, name: key, category: "state" }
        mynodeDataArray.push(temp_node)

        for (var event in json_data[key]["on"]) {
          let temp_node = { key: key+'_'+event, name: event, category: "event", parent: key, events: new Array<any>(), entries: []}
          let new_link = {"from":key,"to":key+'_'+event,"pid":"a"};
        // console.log(json_data[key]["on"][event])
          let conditions = json_data[key]["on"][event];
          if(Object.prototype.toString.call(conditions) === '[object Array]') {
            for (let cond of conditions) {
              temp_node.events.push({pid:cond['cond'], name:cond['cond']})
              let new_link = {"from":key+'_'+event,"to":cond['target'], "pid":cond['cond'], parent: key, name:event};
              mynodeLinkArray.push(new_link)
            }
          }
          else {
            temp_node.events.push({pid:"default", name:"defult"})
            let new_link = {"from":key+'_'+event,"to":conditions['target'], "pid":"default", parent: key, name:event};
            mynodeLinkArray.push(new_link)
          }

          mynodeLinkArray.push(new_link)
          mynodeDataArray.push(temp_node)


        }
      }

      // console.log(mynodeDataArray)
      this.model = new go.GraphLinksModel(
        {
          linkFromPortIdProperty: "pid",  // required information:
          // identifies data property names
          nodeDataArray: mynodeDataArray,
          linkDataArray: mynodeLinkArray
        }
      );

      this.diagram.set_model(this.model)
    });





  }






}
