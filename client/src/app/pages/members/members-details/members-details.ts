import { Component, inject, OnInit, signal } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs';
import { Member } from '../../../types/member';
import { AgePipe } from '../../../core/pipes/age-pipe';
import { AccountServices } from '../../../core/services/account-services';
import { MemberService } from '../../../core/services/member-service';
import { PresenceService } from '../../../core/services/presence-service';

@Component({
  selector: 'app-members-details',
  //Before using resolver
  // imports: [AsyncPipe, RouterLink, RouterLinkActive, RouterOutlet],
  //After using resolver
  imports: [RouterLink, RouterLinkActive, RouterOutlet, AgePipe],
  templateUrl: './members-details.html',
  styleUrl: './members-details.css',
})
export class MembersDetails implements OnInit {
  //Before using resolver
  //private memberService = inject(MemberService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private accountServices = inject(AccountServices);
  protected presenceService = inject(PresenceService);
  //Before using resolver
  // protected member$?: Observable<Member>;
  //After using resolver
  // protected member = signal<Member | null>(null);
  protected title = signal<string>('Profile');
  protected isCurrentUser = signal<boolean>(false);
  protected memberService = inject(MemberService);

  ngOnInit(): void {
    //Before using resolver
    // this.member$ = this.loadMemberDetails();
    //After using resolver
    // this.route.data.subscribe({
    //   next: (data) => {
    //     this.member.set(data['member']);
    //   },
    // });
    this.title.set(this.route.firstChild?.snapshot.title || 'Profile');

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe({
      next: () => {
        this.title.set(this.route.firstChild?.snapshot.title || 'Profile');
      },
    });

    this.route.paramMap.subscribe({
      next: (params) => {
        const memberId = params.get('id');
        if (memberId && this.accountServices.currentUser()?.id === memberId) {
          this.isCurrentUser.set(true);
        } else {
          this.isCurrentUser.set(false);
        }
      },
    });
  }
  //Before using resolver
  // loadMemberDetails() {
  //   const memberId = this.route.snapshot.paramMap.get('id');
  //   if (!memberId) return;
  //   return this.memberService.getMember(memberId);
  // }

  editClick() {
    this.memberService.editMode.set(!this.memberService.editMode());
  }
}
