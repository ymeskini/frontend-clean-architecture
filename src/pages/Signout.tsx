import { userLoggedOut } from "@/lib/auth/usecases/logout.usecase";
import { AppDispatch } from "@/lib/create-store";
import { Flex } from "@chakra-ui/react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export const Signout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(userLoggedOut());
    navigate("/login");
  }, []);

  return <Flex>Signing out...</Flex>;
};
