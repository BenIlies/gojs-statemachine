# AngularGojs

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.2.3.

## Components and Services

the application contains two main components. `diagram.component` is all the code related to statemachine diagram using Gojs library. In `diagram.component` you function `ngAfterViewInit()` where we define the diagram style, logic (what a node should  link to?). `inspector.component` basic functionality is to take the selected node in the diagram and enable the user to edit the content and save. 

Finally,, `manager.service.ts` is a global (singleton) service that manages all models loaded into the application. the   `diagram.component` and `inspector.component` subsribe to it's services to know what model is being loaded and what node is being selected. 

## Development server

Run `npm start` or `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
