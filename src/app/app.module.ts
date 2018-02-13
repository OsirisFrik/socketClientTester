import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { NgxElectronModule } from 'ngx-electron';

import { AppComponent } from './app.component';

import { GlobalsService } from "./services/globals.service";
import { ToastService } from "./services/toast.service";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxElectronModule,
    FormsModule
  ],
  providers: [
    GlobalsService,
    ToastService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
