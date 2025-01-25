import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { VideoCallComponent } from './video-call/video-call.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'app-home', component: HomeComponent },
  { path: 'video-call', component: VideoCallComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
