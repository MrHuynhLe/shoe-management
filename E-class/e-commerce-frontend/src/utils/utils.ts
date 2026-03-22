export const API_FILE_BASE_URL = "http://localhost:8080/api";

export const resolveImageUrl = (url?: string | null) => {
  if (!url) return "";

  if (url.startsWith("http")) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${API_FILE_BASE_URL}${url}`;
  }

  return `${API_FILE_BASE_URL}/${url}`;
};