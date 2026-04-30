export interface UserSignUpRequest {
  email: string;
  name: string;
  gender: string;
  birth: string;
  address: string;
  detailAddress: string;
  phoneNumber: string;
  password: string;
  preferences: number[];
}