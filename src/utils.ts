import { Gender, UserType } from '@prisma/client';

export function calcDateOfBirthFromAge(age: number): Date {
  const today = new Date();
  today.setFullYear(today.getFullYear() - age);
  return today;
}

export function reqParamToGender(gender?: string): Gender | undefined {
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

export function reqParamToUserType(userType?: string): UserType {
  switch (userType) {
    case 'regular':
      return UserType.Regular;
    case 'critic':
      return UserType.Critic;
    default:
      throw new Error('Invalid user type param value');
  }
}
