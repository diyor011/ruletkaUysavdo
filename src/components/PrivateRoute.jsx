import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { logout } from "../redux/authSlice";

const PrivateRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { token, expiry } = useSelector((state) => state.auth);

  useEffect(() => {
    if (expiry && Date.now() > expiry) {
      dispatch(logout()); // muddati tugasa avtomatik chiqib ketadi
    }
  }, [expiry, dispatch]);

  if (!token || (expiry && Date.now() > expiry)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
