import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { InscriptionComponent } from './components/inscription/inscription.component';
import { RendezVousComponent } from './components/rendez-vous/rendez-vous.component';
import { ManagerComponent } from './components/manager/manager.component';

import { ListeRendezvousComponent } from './components/manager/tableau/liste-rendezvous/liste-rendezvous.component';
import { ConfirmationemailComponent } from './components/email/confirmationemail/confirmationemail.component';
import { ResetPasswordComponent } from './components/email/reset-password/reset-password.component';
import { ListeUtilisateurComponent } from './components/manager/tableau/liste-utilisateur/liste-utilisateur.component';

export const routes: Routes = [ { path: 'login', component: LoginComponent },
  { path: 'rendezvous', component:RendezVousComponent  },
  { path: 'listerendezvous', component:ListeRendezvousComponent  },
  { path: 'listeUtilisateur', component:ListeUtilisateurComponent  },
   { path: 'users', component: InscriptionComponent },
   {path:'confirmationemail',component:ConfirmationemailComponent},
   {path:'reset-password',component:ResetPasswordComponent},
   { path: 'manager', component: ManagerComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' } ];
