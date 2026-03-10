import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IRegisterCreds } from '../../types/user';
import { AccountServices } from '../../core/services/account-services';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private accountServices = inject(AccountServices);
  protected creds = {} as IRegisterCreds;
  cancelRegister = output<boolean>();

  register() {
    this.accountServices.register(this.creds).subscribe({
      next: (result) => {
        console.log(result);
        this.cancel();
      },
      error: (error) => {
        console.warn(error);
      },
    });
  }

  cancel() {
    this.cancelRegister.emit(false);
    console.log('Canceled Registrastion');
  }
}
