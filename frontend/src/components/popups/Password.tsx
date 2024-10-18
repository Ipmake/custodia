import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { getBaseURL } from "../../functions";
import { sha256 } from "js-sha256";

function Password({
  closePopUp,
  popUpTarget,
  setPopUpTarget,
}: {
  closePopUp: () => void;
  popUpTarget: string | null;
  setPopUpTarget: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [loading, setLoading] = useState<string | false>(false);

  const valid = () => {
    if (password.length < 3) return false;
    if (password !== confirmPassword) return false;

    return true;
  };

  const submit = () => {
    if (!valid()) return;

    setLoading("Saving password...");
    axios
      .patch(
        `${getBaseURL()}/password`,
        {
          password: sha256(`custodia ${password} custodia`),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(() => {
        closePopUp();
      });
  };

  return (
    <Backdrop
      open
      sx={{
        zIndex: 1000,
      }}
    >
      <Backdrop
        open={Boolean(loading)}
        sx={{
          zIndex: 2000,

          display: "flex",
          flexDirection: "column",
        }}
      >
        <CircularProgress color="inherit" />
        <Typography>{loading}</Typography>
      </Backdrop>
      <Box
        sx={{
          backgroundColor: "#202020",
          width: "500px",
          height: "auto",

          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",

          gap: "10px",
          padding: "1rem",
          borderRadius: "10px",
        }}
      >
        <h1>Change Password</h1>
        <TextField
          label="New Password"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => {
            if (e.target.value.length >= 50) return;
            setPassword(e.target.value);
          }}
        />
        <TextField
          label="Confirm Password"
          variant="outlined"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            if (e.target.value.length >= 50) return;
            setConfirmPassword(e.target.value);
          }}
        />

        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            mt: "3rem",
            gap: "1rem",
          }}
        >
          <Button
            variant="outlined"
            disabled={!valid()}
            sx={{
              width: "100%",
              height: "40px",
              fontWeight: "bold",
              fontSize: "0.75rem",

              "&:hover": {
                backgroundColor: "primary.main",
                color: "#000",
              },
            }}
            onClick={submit}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            sx={{
              width: "100%",
              height: "40px",
              fontWeight: "bold",
              fontSize: "0.75rem",

              "&:hover": {
                backgroundColor: "primary.main",
                color: "#000",
              },
            }}
            onClick={closePopUp}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Backdrop>
  );
}

export default Password;
