import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/authSlice"; 
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const error = useSelector((state) => state.auth.error);
  const [phone, setPhone] = useState("+998");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone || !password) return alert("Telefon va parolni kiriting");

    setLoading(true);
    try {
      const response = await fetch("https://fast.uysavdo.com/api/v1/adminka/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(login({ user: data.user, token: data.access_token }));
        navigate("/dashboard");
      } else {
        alert(data.detail || "Telefon yoki parol noto‘g‘ri");
      }
    } catch (err) {
      console.error(err);
      alert("Server bilan bog‘lanishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100vh] flex">
      {/* Chap tomonda rasm */}
      <div className="h-full w-[55.48%]">
        <img
          className="h-full w-full object-cover"
          src="/assets/imgs/LoginLeftBar.png" // public papkadagi rasm
          alt="Login Image"
        />
      </div>

      {/* O‘ng tomonda forma */}
      <div className="w-[44.52%] flex flex-col items-center">
        <div className="flex justify-center w-full mt-[65px]">
          <img
            className="w-[105px] h-[97px]"
            src="/assets/icons/LoginLogo.png" // public papkadagi logo
            alt="Logo"
          />
        </div>

        <form className="w-[56%] mt-[90px]" onSubmit={handleLogin}>
          <h2 className="text-[24px] font-[700]">Tizimga kirish</h2>
          <label className="mt-[12px]">
            Telefon raqamingiz va parolingizni kiriting
          </label>

          <div className="flex mt-[24px]">
            <input
              className="w-full px-[15px] rounded-[12px] h-[56px] text-black outline-none bg-[#EEEEEE]"
              type="text"
              placeholder="Telefon (+998...)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="flex mt-[8px]">
            <input
              className="w-full px-[15px] rounded-[12px] h-[56px] outline-none text-black bg-[#EEEEEE]"
              type="password"
              placeholder="Parol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="text-red-500 mt-2">{error}</div>}

          <div className="flex justify-center mt-[50px]">
            <button
              className="w-full h-[56px] bg-black text-white rounded-[12px]"
              type="submit"
              disabled={loading}
            >
              {loading ? "Kirish..." : "Kirish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
