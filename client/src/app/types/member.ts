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
