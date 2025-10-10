

export interface JwtPayload {
    name: string ;
    AccessList: string[];
  }
  
  export interface Token {
    access_token: string;
  }