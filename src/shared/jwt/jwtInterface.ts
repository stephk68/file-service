

export interface JwtPayload {
    name: string ;
    sub: number; // user id (recommended)
  }
  
  export interface Token {
    access_token: string;
    refresh_token : string;
  }