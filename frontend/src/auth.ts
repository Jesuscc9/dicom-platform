// src/auth.ts
export const setToken = (token: string) => {
  localStorage.setItem("access", token);
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};
