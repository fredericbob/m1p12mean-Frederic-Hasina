import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StockpieceService } from '../../../services/stockpiece/stockpiece.service';

@Component({
  selector: 'app-piece',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './piece.component.html',
  styleUrl: './piece.component.css'
})
export class PieceComponent {
  pieces: any[] = [];  
  newPiece = { nom: '', types: [] };
  errorMessage: string = '';

  constructor(private stockpieceService: StockpieceService) {}

  ngOnInit(): void {
    this.getPieces();
  }


  getPieces(): void {
    this.stockpieceService.getpiece().subscribe(
      (data) => {
        this.pieces = data;
      },
      (error) => {
        console.error('Erreur lors de la récupération des pièces', error);
        this.errorMessage = 'Erreur lors de la récupération des pièces';
      }
    );
  }


  addPiece(): void {
    this.stockpieceService.addpiece(this.newPiece).subscribe(
      (response) => {
        console.log('Pièce ajoutée:', response);
        this.getPieces();  // Rafraîchir la liste des pièces
        this.newPiece = { nom: '', types: [] };  // Réinitialiser le formulaire
      },
      (error) => {
        console.error('Erreur lors de l\'ajout de la pièce', error);
        this.errorMessage = 'Erreur lors de l\'ajout de la pièce';
      }
    );
  }

  // Méthode pour supprimer une pièce
  deletePiece(id: string): void {
    this.stockpieceService.deletepiece(id).subscribe(
      (response) => {
        console.log('Pièce supprimée:', response);
        this.getPieces();  // Rafraîchir la liste des pièces
      },
      (error) => {
        console.error('Erreur lors de la suppression de la pièce', error);
        this.errorMessage = 'Erreur lors de la suppression de la pièce';
      }
    );
  }
}
