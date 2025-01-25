import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  title = 'ArtzCare';
  services = [
    { title: 'Exames', description: 'Agende seus exames com facilidade.' },
    { title: 'Gravações', description: 'Suas consultas gravadas.' },
    { title: 'Receitas', description: 'Verifique suas receitas disponíveis.' }
  ];
}
