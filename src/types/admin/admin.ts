export interface Admin {
  id: string;
  email: string;
  password: string;
}

export interface AfterAddData {
  actionStatus: boolean;
  message: string;
}

export interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}
