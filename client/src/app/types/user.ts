// export type IUser = {
//   id: string;
//   displayName: string;
//   email: string;
//   token: string;
//   imageUrl?: string;
// }
// These can also be written using interface

export interface IUser {
  id: string;
  displayName: string;
  email: string;
  token: string;
  imageUrl?: string;
  roles?: string[];
}

export interface ILoginCreds {
  email: string;
  password: string;
}

export interface IRegisterCreds {
  email: string;
  password: string;
  displayName: string;
  gender: string;
  dateOfBirth: string;
  city: string;
  country: string;
}
