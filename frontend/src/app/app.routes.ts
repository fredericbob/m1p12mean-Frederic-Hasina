import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { InscriptionComponent } from './components/inscription/inscription.component';
import { RendezVousComponent } from './components/rendez-vous/rendez-vous.component';

export const routes: Routes = [ { path: 'login', component: LoginComponent },
  { path: 'rendezvous', component:RendezVousComponent  },
   { path: 'users', component: InscriptionComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' } ];
