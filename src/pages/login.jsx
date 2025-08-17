import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/authSlice"; // login action
import { useNavigate } from "react-router-dom";

import LoginImage from "../../public/assets/imgs/LoginLeftBar.png";
import Logo from "../../public/assets/icons/LoginLogo.png";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const error = useSelector((state) => state.auth.error); // slice ichidan error
  const [phone, setPhone] = useState("+998");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (phone && password) {
      // Bu joyda backend API chaqirsa bo‘ladi
      if (phone === "+998905122180" && password === "1") {
        dispatch(
          login({
            user: { phone },
            token: "fakeToken123",
          })
        );
        navigate("/dashboard");
      } else {
        alert("Telefon yoki parol noto‘g‘ri!");
      }
    }
  };

  return (
    <div className="h-[100vh] flex">
      {/* Chap tomonda rasm */}
      <div className="h-full w-[55.48%]">
        <img className="h-full w-full" src={LoginImage} alt="Login Image" />
      </div>

      {/* O‘ng tomonda forma */}
      <div className="w-[44.52%] flex flex-col items-center">
        <div className="flex justify-center w-full mt-[65px]">
          <img className="w-[105px] h-[97px]" src={Logo} alt="Logo" />
        </div>

        <form className="w-[56%] mt-[90px]" onSubmit={handleLogin}>
          <h2 className="text-[24px] font-[700]">Tizimga kirish</h2>
          <label className="mt-[12px]">
            Telefon raqamingiz va parolingizni kiriting
          </label>

          <div className="flex mt-[24px]">
            <input
              className="w-full px-[15px] rounded-[12px] h-[56px] outline-none bg-[#EEEEEE]"
              type="text"
              placeholder="Telefon (+998...)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex mt-[8px]">
            <input
              className="w-full px-[15px] rounded-[12px] h-[56px] outline-none bg-[#EEEEEE]"
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
            >
              Kirish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
