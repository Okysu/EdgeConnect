import request from "@/utils/request";

export const uploadSource = (file: File) => {
  const formData = new FormData();
  formData.append("file", file, file.name);
  return request.post("/source/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
