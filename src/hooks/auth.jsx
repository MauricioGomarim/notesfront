import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

export const AuthContext = createContext({});

function AuthProvider({ children }) {
  const [data, setData] = useState({});
  async function signIn({ email, password }) {
    try {
      const response = await api.post("/sessions", { email, password });
      const { user, token } = response.data;

      localStorage.setItem("@rockeatnotes:user", JSON.stringify(user));
      localStorage.setItem("@rockeatnotes:token", token);

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setData({ user, token });

      console.log(user, token);
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Não foi possivel logar.");
      }
    }
  }

  async function signOut() {
    const token = localStorage.removeItem("@rockeatnotes:token");
    const user = localStorage.removeItem("@rockeatnotes:user");

    setData({});
  }

  async function updateProfile({ user, avatarFile }) {
    try {
      if(avatarFile){
        const fileUploadForm = new FormData();
        fileUploadForm.append("avatar", avatarFile);
        console.log(fileUploadForm)
        const response = await api.patch("/users/avatar", fileUploadForm);
        user.avatar = response.data.avatar;
      }

      await api.put("/users", user);
      localStorage.setItem("@rockeatnotes:user", JSON.stringify(user));

      setData({ user, token: data.token});

      alert("Perfil atualizado!")

    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Não foi possivel atualizar o perfil");
      }
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("@rockeatnotes:token");
    const user = localStorage.getItem("@rockeatnotes:user");

    if (token && user) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setData({
        token,
        user: JSON.parse(user),
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ signIn, user: data.user, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  return context;
}

export { AuthProvider, useAuth };
