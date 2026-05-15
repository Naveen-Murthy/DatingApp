import { Component, inject, OnInit, signal } from '@angular/core';
import { AdminService } from '../../../core/services/admin-service';
import { IUser } from '../../../types/user';
import { Modal } from '../../../shared/modal/modal';

@Component({
  selector: 'app-user-management',
  imports: [Modal],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
})
export class UserManagement implements OnInit {
  private adminService = inject(AdminService);
  users = signal<IUser[]>([]);
  protected availableRoles = ['Admin', 'Moderator', 'Member'];
  protected selectedUser: IUser | null = null;
  protected isRolesModalOpen = signal<boolean>(false);

  ngOnInit(): void {
    this.loadUsersWithRoles();
  }

  loadUsersWithRoles() {
    this.adminService.getUsersWithRoles().subscribe({
      next: (users) => this.users.set(users as IUser[]),
    });
  }

  openModal(user: IUser) {
    this.selectedUser = user;
    this.isRolesModalOpen.set(true);
  }

  onClose() {
    this.isRolesModalOpen.set(false);
  }

  toogleRole(event: Event, role: string) {
    if (!this.selectedUser) return;
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedUser.roles = [...(this.selectedUser.roles || []), role];
    } else {
      this.selectedUser.roles = this.selectedUser.roles?.filter((r) => r !== role);
    }
  }

  updateRoles() {
    if (!this.selectedUser) return;
    this.adminService
      .updateUserRoles(this.selectedUser.id, this.selectedUser.roles || [])
      .subscribe({
        next: (updatedRoles) => {
          this.users.update((users) =>
            users.map((user) => {
              if (user.id === this.selectedUser?.id) {
                return { ...user, roles: updatedRoles };
              }
              return user;
            }),
          );
          this.onClose();
        },
      });
  }
}
