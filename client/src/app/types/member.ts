export type Member = {
  id: string;
  displayName: string;
  dateofBirth: string;
  imageUrl?: string;
  description?: string;
  gender: string;
  city: string;
  country: string;
  created: string;
  lastActive: string;
};

export type Photo = {
  id: number;
  url: string;
  publicId?: string;
  memberId: string;
};

export type EditableMember = {
  displayName: string;
  dateofBirth: string;
  description?: string;
  city: string;
  country: string;
};

export class MemberParams {
  gender?: string;
  minAge = 18;
  maxAge = 100;
  pageNumber = 1;
  pageSize = 10;
  orderBy = 'lastActive';
}
