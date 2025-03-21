import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl= `${environment.apiUrl}/login`;
  private apiUrlInscription= `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }
  getUtilisateur(): Observable<any> {
    return this.http.get(this.apiUrl);
      }
      addutilisateur(utilisateur: any): Observable<any> {
    return this.http.post(this.apiUrlInscription, utilisateur);
      }
      login(utilisateur: any): Observable<any> {
        return this.http.post(this.apiUrl, utilisateur);
          }
      updateutilisateur(id: string, utilisateur: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, utilisateur);
      }
      deleteutilisateur(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
      }
    }

