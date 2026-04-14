import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountServices } from '../../core/services/account-services';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastService } from '../../core/services/toast-service';
import { themes } from '../theme';

@Component({
  selector: 'app-header',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  protected accountServices = inject(AccountServices);
  protected router = inject(Router);
  private toast = inject(ToastService);
  protected creds: any = {};
  protected selectedTheme = signal<string>(localStorage.getItem('theme') || 'light');
  protected themes = themes;

  ngOnInit(): void {
    document.documentElement.setAttribute('data-theme', this.selectedTheme());
  }

  login() {
    this.accountServices.login(this.creds).subscribe({
      next: (result) => {
        this.router.navigateByUrl('/members');
        this.creds = {};
        this.toast.success('Logged in successfully!');
      },
      error: (err) => {
        console.warn(err.error);
        this.toast.error(err.error);
      },
    });
  }

  logout() {
    this.router.navigateByUrl('/');
    this.accountServices.logout();
  }

  changeTheme(theme: string) {
    this.selectedTheme.set(theme);
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    const elem = document.activeElement as HTMLElement;
    if (elem) {
      elem.blur();
    }
  }
}
