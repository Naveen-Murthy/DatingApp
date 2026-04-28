import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { Member } from '../../../types/member';
import { DatePipe } from '@angular/common';
import { MemberService } from '../../../core/services/member-service';
import { ToastService } from '../../../core/services/toast-service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AccountServices } from '../../../core/services/account-services';
import { TimeAgoPipe } from '../../../core/pipes/time-ago-pipe';

@Component({
  selector: 'app-member-profile',
  imports: [DatePipe, ReactiveFormsModule, TimeAgoPipe],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.css',
})
export class MemberProfile implements OnInit, OnDestroy {
  protected memberService = inject(MemberService);
  protected toast = inject(ToastService);
  protected accountServices = inject(AccountServices);
  profileForm: FormGroup = new FormGroup({
    displayName: new FormControl(''),
    dateofBirth: new FormControl(''),
    description: new FormControl(''),
    city: new FormControl(''),
    country: new FormControl(''),
  });
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.profileForm.dirty) {
      $event.returnValue = true;
    }
  }

  ngOnInit(): void {
    this.profileForm.setValue({
      displayName: this.memberService.member()?.displayName || '',
      dateofBirth: this.memberService.member()?.dateofBirth || '',
      description: this.memberService.member()?.description || '',
      city: this.memberService.member()?.city || '',
      country: this.memberService.member()?.country || '',
    });
  }

  updateMember() {
    if (!this.memberService.member()) return;
    const updatedMember = { ...this.memberService.member(), ...this.profileForm.value } as Member;
    this.memberService.updateMember(this.memberService.member()!.id, updatedMember).subscribe({
      next: () => {
        const currentUser = this.accountServices.currentUser();
        if (currentUser && updatedMember.displayName !== currentUser.displayName) {
          this.accountServices.setCurrentUser({
            ...currentUser,
            displayName: updatedMember.displayName,
          });
        }
        this.toast.success('Member updated successfully');
        this.memberService.editMode.set(false);
        this.memberService.member.set(updatedMember as Member);
        this.profileForm.reset(updatedMember);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.memberService.editMode()) {
      this.memberService.editMode.set(false);
    }
  }
}
