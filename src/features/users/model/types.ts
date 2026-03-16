export interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  thirdName?: string;
}

export interface UpdateUserPayload {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  thirdName?: string;
}
