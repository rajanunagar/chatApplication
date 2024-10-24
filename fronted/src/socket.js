import socketIO from "socket.io-client";
import { getToken } from "./functions/function";
import { getOffsetLeft } from "@mui/material";
export const socket = socketIO.connect("192.168.0.57:5001", {
    // query: {getToken()}
  })