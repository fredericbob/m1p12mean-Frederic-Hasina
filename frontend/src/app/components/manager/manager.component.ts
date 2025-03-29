import { Component } from '@angular/core';
import { UtilisateurService } from '../../services/utilisateur.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manager.component.html',
  styleUrl: './manager.component.css'
})
export class ManagerComponent {
  user: any = { name: '', role: '' };
  isDropdownOpen = false;

  constructor(private utilisateurService: UtilisateurService,private router: Router) {}

  ngOnInit(): void {
    const userDetails = this.utilisateurService.getUserIdFromToken();
    if (userDetails) {
      this.user.name = userDetails.email;
      this.user.role = userDetails.role;
    }
  }

  toggleDropdown(): void {
    console.log('Toggle dropdown');
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout(): void {
    localStorage.removeItem('token'); // Supprimer le token
    this.isDropdownOpen = false; // Fermer le menu
    this.router.navigate(['/login']); // Rediriger vers login
  }
}
