import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ManagerService } from '../manager.service';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  navbarOpen = false;
  private model: go.Model;
  downloadJsonHref: any = ""

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  constructor(private ModelManager:ManagerService, private sanitizer: DomSanitizer) {

    this.ModelManager.model$.subscribe(
      data => {
        this.set_model(data)
      });

   }

  public set_model(model: any) {
    this.model = model;

  }
  ngOnInit(): void {
  }

  load(){
    this.ModelManager.load_static_file();
  }

  export(){
    let data = this.ModelManager.to_json(this.model);
    var jsonObj = JSON.parse(data);
    var jsonPretty = JSON.stringify(jsonObj, null, '\t');
    var myWindow = window.open("data:text/json", '_blank');
    myWindow!.document.write('<html><body><pre>' + jsonPretty + '</pre></body></html>');

  }

  generateDownloadJsonUri() {
    // this function is testing for download link (not functional yet!)
    var theJSON = this.ModelManager.to_json(this.model.toJson())
    var uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json," + encodeURIComponent(theJSON));
    this.downloadJsonHref = uri;
    var myWindow = window.open(uri.toString(), '_blank');
    myWindow?.focus()

}

}
