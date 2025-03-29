import { Component } from '@angular/core';
import { RendezvousService } from '../../../../services/rendez_vous/rendezvous.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-liste-rendezvous',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './liste-rendezvous.component.html',
  styleUrl: './liste-rendezvous.component.css'
})
export class ListeRendezvousComponent {
  rendezVousList: any[] = [];
  selectedVehicule: any = null;
  selectedRendezvous: any = null;

  isModalOpen: boolean = false;
  selectedMecanicien: string = '';
mecaniciensList: any[] = [];
isMecanicienModalOpen = false;

  constructor(private rendezvousService: RendezvousService) {}

  ngOnInit() {
    this.getRendezVous();
  }

  getRendezVous() {
    this.rendezvousService.getRendezVous().subscribe(
      (data) => {
        console.log(data);
        this.rendezVousList = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des rendez-vous', error);
      }
    );
  }

  openModal(vehicule: any) {
    console.log("Véhicule sélectionné :", vehicule); // Vérifie si ça s'affiche dans la console
    this.selectedVehicule = vehicule;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  openMecanicienModal(rendezvous: any) {
    this.selectedRendezvous = rendezvous;
    this.isMecanicienModalOpen = true;

    // Récupérer la liste des mécaniciens
    this.rendezvousService.getMecaniciens().subscribe(
      (data) => {
        this.mecaniciensList = data;
      },
      (error) => {
        console.error("Erreur lors du chargement des mécaniciens :", error);
      }
    );
  }

  // Fermer le modal
  closeMecanicienModal() {
    this.isMecanicienModalOpen = false;
    this.selectedMecanicien = '';
  }

  // Assigner un mécanicien au rendez-vous
  assignMecanicien() {
    if (!this.selectedMecanicien) {
      alert("Veuillez sélectionner un mécanicien.");
      return;
    }

    this.rendezvousService.assignMecanicienToRendezvous(this.selectedRendezvous._id, this.selectedMecanicien)
      .subscribe(
        (response) => {
          console.log("Mécanicien assigné avec succès :", response);
          this.closeMecanicienModal();
        },
        (error) => {
          console.error("Erreur lors de l'assignation du mécanicien :", error);
        }
      );
  }
}
