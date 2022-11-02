import { Component, OnInit } from '@angular/core';
import { ManagerService } from '../manager.service';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  navbarOpen = false;

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  constructor(private ModelManager:ManagerService) { }

  ngOnInit(): void {
  }

  load(){
    this.ModelManager.load_static_file();
  }

  export(){
    // this.ModelManager.()
  }

}
