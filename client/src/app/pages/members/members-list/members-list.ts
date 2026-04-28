import { Component, inject, OnInit, signal } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { Member, MemberParams } from '../../../types/member';
import { MemberCard } from '../../../layout/member/member-card/member-card';
import { PaginatedResult } from '../../../types/pagination';
import { Paginator } from '../../../shared/paginator/paginator';
import { Modal } from '../../../shared/modal/modal';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-members-list',
  imports: [MemberCard, Paginator, Modal, FormsModule],
  templateUrl: './members-list.html',
  styleUrl: './members-list.css',
})
export class MembersList implements OnInit {
  private memberService = inject(MemberService);
  protected paginatedMembers = signal<PaginatedResult<Member> | null>(null);
  protected memberParams = new MemberParams();
  protected isFilterModal = signal<boolean>(false);
  protected updatedMemParams = new MemberParams();

  constructor() {
    const filters = localStorage.getItem('filters');
    if (filters) {
      this.memberParams = JSON.parse(filters);
    }
  }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers() {
    this.updatedMemParams = { ...this.memberParams };
    this.memberService.getMembers(this.memberParams).subscribe({
      next: (result) => {
        this.paginatedMembers.set(result);
      },
    });
  }

  onPageChange(event: { pageNumber: number; pageSize: number }) {
    this.memberParams.pageSize = event.pageSize;
    this.memberParams.pageNumber = event.pageNumber;
    this.loadMembers();
  }

  openModal() {
    this.isFilterModal.set(true);
  }

  onClose() {
    this.isFilterModal.set(false);
  }

  resetFilters() {
    this.memberParams = new MemberParams();
    this.loadMembers();
  }

  onMinAgeChange() {
    if (this.memberParams.minAge < 18) this.memberParams.minAge = 18;
  }

  onMaxAgeChange() {
    if (this.memberParams.maxAge < this.memberParams.minAge) {
      this.memberParams.maxAge = this.memberParams.minAge;
    }
  }

  onSubmit() {
    this.loadMembers();
    this.onClose();
  }

  get diaplayFilters(): string {
    const defaultParams = new MemberParams();

    const filtersApplied: string[] = [];

    if (this.updatedMemParams.gender) {
      filtersApplied.push(this.updatedMemParams.gender + 's');
    }

    if (
      this.updatedMemParams.minAge !== defaultParams.minAge ||
      this.updatedMemParams.maxAge !== defaultParams.maxAge
    ) {
      filtersApplied.push(`Ages ${this.updatedMemParams.minAge}-${this.updatedMemParams.maxAge}`);
    }

    return filtersApplied.length > 0 ? `Applied filters: ${filtersApplied.join(' | ')}` : '';
  }
}
