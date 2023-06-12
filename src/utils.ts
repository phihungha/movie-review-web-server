import { Gender, UserType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export function calcDateOfBirthFromAge(age: number) {
  const today = new Date();
  today.setFullYear(today.getFullYear() - age);
  return today;
}

export function getGenderFromReqParam(gender?: string): Gender | undefined {
  switch (gender as 'male' | 'female' | 'other' | undefined) {
    case 'male':
      return Gender.Male;
    case 'female':
      return Gender.Female;
    case 'other':
      return Gender.Other;
    case undefined:
      return undefined;
    default:
      throw new Error('Invalid gender param value');
  }
}

export function getUserTypeFromReqParam(userType?: string): UserType {
  switch (userType) {
    case 'regular':
      return UserType.Regular;
    case 'critic':
      return UserType.Critic;
    default:
      throw new Error('Invalid user type param value');
  }
}

export async function generateHashedPassword(
  password: string,
): Promise<string> {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
}
