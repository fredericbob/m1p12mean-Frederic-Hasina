import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { InscriptionComponent } from './components/inscription/inscription.component';

export const routes: Routes = [ { path: 'login', component: LoginComponent },  { path: 'users', component: InscriptionComponent },
    { path: '', redirectTo: 'users', pathMatch: 'full' } ];
