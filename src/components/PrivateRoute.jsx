import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { logout } from "../redux/authSlice";

const PrivateRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { token, expiry } = useSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (expiry && Date.now() > expiry) {
      dispatch(logout());
    }
    setIsChecking(false); // tekshiruv tugadi
  }, [expiry, dispatch]);

  if (isChecking) {
    return <div className="text-center mt-10 text-gray-500">Tekshirilmoqda...</div>;
  }

  if (!token || (expiry && Date.now() > expiry)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
