import request from "@/utils/request";

export const getAuthorizations = () => {
  return request.get("/auth");
}