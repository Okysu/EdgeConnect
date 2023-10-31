import request from "@/utils/request";

export const login = (agrs: { username: string; password: string }) => {
  return request.post("/user/login", agrs);
};

export const logout = () => {
  return request.delete("/user/logout");
};

export const getUserInfo = () => {
  return request.get("/user/info");
};

type UserInfoForm = {
  nickname: string;
  avatar_url: string;
};

export const updateUserInfo = (data: UserInfoForm) => {
  return request.put("/user/info", data);
};

type UserPasswordForm = {
  old_password: string;
  new_password: string;
};

export const resetPassword = (data: UserPasswordForm) => {
  return request.put("/user/reset-password", data);
};

export const sendValidCode = (email: string) => {
  return request.post("/user/valid", { email });
};

export const register = (data: {
  nickname: string;
  email: string;
  password: string;
  code: string;
}) => {
  return request.post("/user/register", data);
};
