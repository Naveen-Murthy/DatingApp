import { Component, inject } from '@angular/core';
import { AccountServices } from '../../core/services/account-services';
import { UserManagement } from '../../layout/admin/user-management/user-management';
import { PhotoManagement } from '../../layout/admin/photo-management/photo-management';

@Component({
  selector: 'app-admin',
  imports: [UserManagement, PhotoManagement],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  protected accountService = inject(AccountServices);
  activeTab = 'photos';

  tabs = [
    { label: 'Photo moderation', value: 'photos' },
    { label: 'User management', value: 'roles' },
  ];

  setTab(tab: string) {
    this.activeTab = tab;
  }
}
