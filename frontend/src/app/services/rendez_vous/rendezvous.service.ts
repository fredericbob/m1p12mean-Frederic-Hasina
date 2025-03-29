import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RendezvousService {
 private apiUrl= `${environment.apiUrl}/rendezvous`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Récupération du token
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`, // Ajout du token dans l'en-tête
      'Content-Type': 'application/json'
    });
  }
  addRendezVous(rendezVous: any): Observable<any> {
    return this.http.post(this.apiUrl, rendezVous);
  }

  getRendezVous(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }

  // Récupérer la liste des mécaniciens
// Récupérer la liste des mécaniciens
getMecaniciens(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/mecanicien`, { headers: this.getHeaders() });
}

// Assigner un mécanicien à un rendez-vous
assignMecanicienToRendezvous(rendezvousId: string, mecanicienId: string) {
  return this.http.post(`https://ton-api.com/rendezvous/${rendezvousId}/assign-mecanicien`, { mecanicienId });
}

}
