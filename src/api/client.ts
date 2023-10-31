import request from "@/utils/request";

export const getClients = () => {
  return request.get("/client");
};

export const addClient = (data: ClientForm) => {
  return request.post("/client/add", data);
};

export const updateClient = (data: ClientForm) => {
  return request.put(`/client/update/${data.id}`, data);
};

export const deleteClient = (id: uuid) => {
  return request.delete(`/client/delete/${id}`);
};

export const getClient = (id: uuid) => {
  return request.get(`/client/${id}`);
}