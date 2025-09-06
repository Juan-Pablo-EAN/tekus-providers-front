import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { Login } from './components/login/login';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'dashboard', component: Dashboard },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
