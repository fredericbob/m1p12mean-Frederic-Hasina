import { Component, OnInit } from '@angular/core';
import { UtilisateurService } from '../../services/utilisateur.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
user={email:'',mdp:''};
errorMessage: string = '';

  utilisateur: any[] = [];
    constructor(private utilisateurservice: UtilisateurService) {}
      ngOnInit(): void {
    this.loadUtilisateur();
}
      loadUtilisateur(): void {
    this.utilisateurservice.getUtilisateur().subscribe(data => this.utilisateur =
    data);
  }
  deleteUtilisateur(id: string): void {
this.utilisateurservice.deleteutilisateur(id).subscribe(() =>
this.loadUtilisateur());
  }
  onLogin(): void {
    this.utilisateurservice.login(this.user).subscribe(
      (response: any) => {
        console.log('Connexion réussie:', response);
        if (response.token) {
          localStorage.setItem('token', response.token);
          const userId = this.utilisateurservice.getUserIdFromToken();
          alert('Connexion réussie ! ID Utilisateur: ' + userId);
        } else {
          alert('Erreur: Aucun token reçu.');
        }
      },
      (error) => {
        console.error('Erreur de connexion:', error);
        this.errorMessage = "Email ou mot de passe incorrect.";
      }
    );
  }

}


