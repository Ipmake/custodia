import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { getBaseURL } from "../functions";
import { sha256 } from "js-sha256";

function Login() {
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log("Checking token");
    if (localStorage.getItem("token")) {
      axios
        .get(`${getBaseURL()}/verifyToken`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((res) => {
          console.log(res.data);
          if (res.data.authenticated) window.location.href = "/";
        })
        .catch(() => {
          localStorage.removeItem("token");
        });
    }

    setLoading(false);
  }, []);

  const login = async () => {
    if (loading) return;
    setError(null);
    setLoading(true);
    if (!password || password.length === 0) {
      setError("Password is required");
      setLoading(false);
      return;
    }

    const res = await axios
      .post(`${getBaseURL()}/login`, {
        password: sha256(`custodia ${password} custodia`),
      })
      .catch((err: AxiosError) => {
        if ((err.response?.data as any).error) {
          setError((err.response?.data as any).message);
          setLoading(false);
        } else {
          setError("An unknown error occured");
          setLoading(false);
        }
      });

    if (!res) return setLoading(false);

    localStorage.setItem("token", res.data.token);
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1rem",
          border: "1px solid #ccc",
          borderRadius: "1rem",
        }}
      >
        <Avatar
          src="logo.png"
          sx={{
            width: "5rem",
            height: "5rem",
            fontSize: "3rem",
          }}
        />
        <Typography
          sx={{
            fontSize: "2rem",
            fontWeight: "bold",
            marginTop: "-2rem",
          }}
        >
          Custodia
        </Typography>
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          error={!!error}
          helperText={error}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") login();
          }}
        />

        <Button
          variant="contained"
          disabled={loading || !password || password.length === 0}
          color="primary"
          sx={{
            width: "100%",
          }}
          onClick={login}
        >
          {loading ? <CircularProgress /> : "Login"}
        </Button>
      </Box>
    </Box>
  );
}

export default Login;
