import { Component } from '@angular/core';
import { RendezvousService } from '../../services/rendez_vous/rendezvous.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rendez-vous',
  standalone: true,
  imports:  [CommonModule, FormsModule],
  templateUrl: './rendez-vous.component.html',
  styleUrl: './rendez-vous.component.css'
})
export class RendezVousComponent {
  rendezVous = {
    client_id: '',
    vehicule_id: '',
    date_rdv: '',
    prestations: [{ prestation_id: '' }]
  };

  constructor(private rendezVousService: RendezvousService) {}

  onSubmit() {
    this.rendezVousService.addRendezVous(this.rendezVous).subscribe(
      response => {
        console.log('Rendez-vous créé', response);
      },
      error => {
        console.error('Erreur lors de la création du rendez-vous', error);
      }
    );
  }
}
