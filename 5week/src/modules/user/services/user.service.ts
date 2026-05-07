import bcrypt from "bcryptjs";
import { UserSignUpRequest } from "../dtos/user.dto";
import { addUser, getUserByEmail, setPreference } from "../repositories/user.repository";

export const userSignUp = async (body: UserSignUpRequest) => {
  // 이메일 중복 확인
  const existingUser = await getUserByEmail(body.email);
  if (existingUser) {
    throw new Error("이미 존재하는 이메일입니다.");
  }

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(body.password, 10);

  const userId = await addUser({
    email: body.email,
    name: body.name,
    gender: body.gender,
    birth: body.birth,
    address: body.address,
    detail_address: body.detailAddress,
    phone_number: body.phoneNumber,
    password: hashedPassword,
  });

  // 선호 카테고리 저장
  for (const preferenceId of body.preferences) {
    await setPreference(userId, preferenceId);
  }

  return { id: userId, email: body.email, name: body.name };
};