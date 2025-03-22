import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RendezvousService {
 private apiUrl= `${environment.apiUrl}/rendezvous`; 

  constructor(private http: HttpClient) { }


  addRendezVous(rendezVous: any): Observable<any> {
    return this.http.post(this.apiUrl, rendezVous);
  }

  getRendezVous(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
