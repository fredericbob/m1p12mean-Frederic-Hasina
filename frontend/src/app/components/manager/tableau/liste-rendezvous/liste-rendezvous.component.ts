import { Component } from '@angular/core';
import { RendezvousService } from '../../../../services/rendez_vous/rendezvous.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-liste-rendezvous',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './liste-rendezvous.component.html',
  styleUrl: './liste-rendezvous.component.css'
})
export class ListeRendezvousComponent {
 rendezVousList: any[] = [];
 selectedVehicule: any = null;
 isModalOpen: boolean = false;
  constructor(private rendezvousService:RendezvousService){}
  ngOnInit() {
    this.getRendezVous();
  }

  getRendezVous() {
    this.rendezvousService.getRendezVous().subscribe(
      (data) => {
        this.rendezVousList = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des rendez-vous', error);
      }
    );
  }

  openModal(vehiculeId: string): void {
    const selectedRdv = this.rendezVousList.find(rdv => rdv.vehicule_id._id === vehiculeId);
    this.selectedVehicule = selectedRdv ? selectedRdv.vehicule_id : null;

    if (this.selectedVehicule) {
      this.isModalOpen = true;
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

}
