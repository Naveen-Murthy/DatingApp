import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { MembersDetails } from './pages/members/members-details/members-details';
import { MembersList } from './pages/members/members-list/members-list';
import { Lists } from './pages/lists/lists';
import { Messages } from './pages/messages/messages';
import { authGuard } from './core/guards/auth-guard';
import { NotFound } from './shared/errors/not-found/not-found';
import { ServerError } from './shared/errors/server-error/server-error';
import { MemberProfile } from './layout/member/member-profile/member-profile';
import { MemberPhotos } from './layout/member/member-photos/member-photos';
import { MemberMessages } from './layout/member/member-messages/member-messages';
import { memberResolver } from './layout/member/member-resolver';
import { profileUnsavedChangesGuardGuard } from './core/guards/profile-unsaved-changes-guard-guard';
import { Admin } from './pages/admin/admin';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      { path: 'members', component: MembersList },
      {
        path: 'members/:id',
        resolve: { member: memberResolver },
        runGuardsAndResolvers: 'always',
        component: MembersDetails,
        children: [
          { path: '', redirectTo: 'profile', pathMatch: 'full' },
          {
            path: 'profile',
            component: MemberProfile,
            title: 'Profile',
            canDeactivate: [profileUnsavedChangesGuardGuard],
          },
          { path: 'photos', component: MemberPhotos, title: 'Photos' },
          { path: 'messages', component: MemberMessages, title: 'Messages' },
        ],
      },
      { path: 'lists', component: Lists },
      { path: 'messages', component: Messages },
      { path: 'admin', component: Admin, canActivate: [adminGuard] },
    ],
  },
  { path: 'server-error', component: ServerError },
  { path: '**', component: NotFound },
];
