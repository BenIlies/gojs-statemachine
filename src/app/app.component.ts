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

  public selectedNode!: go.Node;
  public model: go.GraphLinksModel;
  public model_list: go.GraphLinksModel[];
  public new_model_toggle = true
  public new_model_name = "new model"



  constructor(private ModelManager:ManagerService, private http: HttpClient) {
    this.model = ModelManager.model ;
    this.model_list = this.ModelManager.model_list;

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


  select(n: number){
    this.ModelManager.selectModel(this.ModelManager.model_list[n])
  }

  onCommitNewModelForm(){
    this.ModelManager.create_new_model(this.new_model_name)
    this.new_model_toggle = !this.new_model_toggle
    this.new_model_name = ""
  }

}
