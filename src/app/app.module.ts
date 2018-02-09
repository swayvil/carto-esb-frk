import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { CartoComponent } from './carto/carto.component';

import { CartoService } from './carto/carto.service';

const ROUTES = [
    {
        path: '',
        redirectTo: 'carto',
        pathMatch: 'full'
    },
    {
        path: 'carto',
        component: CartoComponent
    },
    {
        path: 'carto/:id',
        component: CartoComponent
    }
];

@NgModule( {
    declarations: [
        AppComponent,
        CartoComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        RouterModule.forRoot( ROUTES )
    ],
    providers: [CartoService],
    bootstrap: [AppComponent]
} )
export class AppModule { }
