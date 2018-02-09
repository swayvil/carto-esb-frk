import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class CartoService {
    constructor( private http: Http ) { }

    // Get carto from the API
    public getCarto( id: string ) {
        return this.http.get( '/api/carto/' + id )
            .map( res => res.json() );
    }
}