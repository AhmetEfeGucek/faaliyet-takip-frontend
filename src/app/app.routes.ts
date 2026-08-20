import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { VerifyComponent } from './components/verify/verify';
import { DashboardComponent } from './components/dashboard/dashboard';
import { ActivityCreateComponent } from './components/activity-create/activity-create';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify', component: VerifyComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'create-activity', component: ActivityCreateComponent },
  { path: '**', redirectTo: 'login' }
];
