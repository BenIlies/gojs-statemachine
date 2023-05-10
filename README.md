# AngularGojs

This project is an interface to create statemachines for NoPASARAN: a Novel Platform to Analyse Semi Active elements in Routes Across the Network


## Components and Services


the application contains two main components. `diagram.component` is all the code related to statemachine diagram using Gojs library. In `diagram.component` you function `ngAfterViewInit()` where we define the diagram style, logic (what a node should  link to?). `inspector.component` basic functionality is to take the selected node in the diagram and enable the user to edit the content and save. 

Finally,, `manager.service.ts` is a global (singleton) service that manages all models loaded into the application. the   `diagram.component` and `inspector.component` subsribe to it's services to know what model is being loaded and what node is being selected. 

## Statemachine files
the states are stored in json format under the assets folder. They are loaded in the constructor function of `manager.service.ts`


## Development server

Run `npm start` or `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.


