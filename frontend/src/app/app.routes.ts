import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { InscriptionComponent } from './components/inscription/inscription.component';
import { RendezVousComponent } from './components/rendez-vous/rendez-vous.component';
import { ManagerComponent } from './components/manager/manager.component';

import { ListeRendezvousComponent } from './components/manager/tableau/liste-rendezvous/liste-rendezvous.component';

export const routes: Routes = [ { path: 'login', component: LoginComponent },
  { path: 'rendezvous', component:RendezVousComponent  },
  { path: 'listerendezvous', component:ListeRendezvousComponent  },
   { path: 'users', component: InscriptionComponent },
   { path: 'manager', component: ManagerComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' } ];
