import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private http = inject(HttpClient);
  protected readonly title = signal('Dating App');
  protected members = signal<any>([]);

  // ngOnInit(): void {
  //   this.http.get('https://localhost:5001/api/members').subscribe({
  //     next: (response) => {
  //       this.members.set(response);
  //     },
  //     error: (error) => {
  //       console.warn(error);
  //     },
  //     complete: () => {
  //       console.log('Completed the HTTP request.');
  //     },
  //   });
  // }

  // Instead of Subscribe we can make use of promise because subscribe won't stop until it is completed
  // as we won't know in some cases it won't stop.

  async ngOnInit() {
    this.members.set(await this.getMembers());
  }

  async getMembers() {
    try {
      return firstValueFrom(this.http.get('https://localhost:5001/api/members'));
    } catch (error) {
      console.warn('Error', error);
      throw error;
    }
  }
}
