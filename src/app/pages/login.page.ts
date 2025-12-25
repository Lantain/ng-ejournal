import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Field, form } from '@angular/forms/signals';

@Component({
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatCardModule, MatButtonModule, Field],
  providers: [AuthService],
  template: `
    <div class="bg-gray-50 flex flex-col items-center justify-center h-screen">
      <form class="flex flex-col gap-2 p-8" (ngSubmit)="onSubmit()">
        <mat-card class="p-4 min-w-[400px]" appearance="outlined">
          <mat-card-header>
            <mat-card-title class="pb-6">Вхід в електронний журнал</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="flex flex-col gap-2">
              <mat-form-field>
                <mat-label>Логін</mat-label>
                <input matInput [field]="loginForm.username" />
              </mat-form-field>
              <mat-form-field>
                <mat-label>Пароль</mat-label>
                <input matInput [field]="loginForm.password" type="password" />
              </mat-form-field>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <div class="w-full">
              <div class="text-red-500 text-center">{{ error() }}</div>

              <button
                [disabled]="!loginForm.username() || !loginForm.password() || isLoading()"
                type="submit"
                class="w-full mt-4"
                matButton="filled"
              >
                {{ isLoading() ? 'Відправка...' : 'Вхід' }}
              </button>
            </div>
          </mat-card-actions>
        </mat-card>
      </form>
    </div>
  `,
})
export class LoginPage {
  loginModel = signal({
    username: '',
    password: '',
  });
  loginForm = form(this.loginModel);
  error = signal<string | null>(null);
  isLoading = signal(false);

  constructor(private authService: AuthService, private router: Router) {
    if (sessionStorage.getItem('username') && sessionStorage.getItem('password')) {
      this.loginModel.set({
        username: sessionStorage.getItem('username')!,
        password: sessionStorage.getItem('password')!,
      });
      this.onSubmit();
    }
  }

  onSubmit() {
    this.isLoading.set(true);
    this.authService.signin(this.loginModel().username, this.loginModel().password).subscribe({
      next: (res) => {
        if (this.authService.isLoggedIn()) {
          this.authService.me().subscribe((user) => {
            const u = { ...res.user, ...user };
            sessionStorage.setItem('user', JSON.stringify(u));
            this.router.navigate(['/dashboard']);
          });
        }
      },
      error: (err) => {
        console.log('err', err);
        this.error.set('Невірний логін або пароль');
        this.authService.flushCredentials();
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
        this.loginForm().reset();
      },
    });
  }
}
