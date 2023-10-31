declare type uuid = string;

declare type User = {
  identity_id: uuid;
  nickname: string;
  avatar_url: string;
  email: string;
  updated_at?: string;
};

declare type Client = {
  id: uuid;
  created_at: string;
  description: string;
  domain: string;
  name: string;
  redirect_uri: string;
  valid: boolean;
  secret: string;
  disabled: boolean;
  hide_id: boolean;
  hide_secret: boolean;
};

declare type ClientForm = {
  id?: uuid;
  name: string;
  description: string;
  domain: string;
  redirect_uri: string;
};

declare type Authorization = {
  client_id: uuid;
  client_name: string;
  client_domain: string;
  scope: string;
  ip_address: string;
  authorization_time: string;
};
