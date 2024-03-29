import { Component, ViewChild } from '@angular/core';
import * as go from 'gojs'
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DiagramComponent } from './diagram/diagram.component';
import { ManagerService } from './manager.service';


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


  public model_list: go.GraphLinksModel[];
  public new_model_toggle = true
  public new_model_name = "new model"



  constructor(private ModelManager:ManagerService, private http: HttpClient) {
    this.model_list = this.ModelManager.model_list;
    console.log(this.model_list)

  }

  ngAfterViewInit() {
    // child is set
    // this.fromJson()

  }



  public setSelectedNode(node: any) {
    // this.ModelManager.selectedNode = node;
    this.ModelManager.selectNode(node)
    // console.log(node.data)
    // this.selectedNode = node.data;

  }



  select(n: number){
    console.log(this.ModelManager.model_list[n].toJson())
    this.ModelManager.selectModel(this.ModelManager.model_list[n])
  }

  onCommitNewModelForm(){
    this.ModelManager.create_new_model(this.new_model_name)
    this.new_model_toggle = !this.new_model_toggle
    this.new_model_name = ""
  }

}
