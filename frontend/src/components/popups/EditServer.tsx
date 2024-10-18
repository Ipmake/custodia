import {
  Autocomplete,
  Backdrop,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import UploadButton from "../UploadButton";
import { FileOpen } from "@mui/icons-material";
import axios from "axios";
import { getBaseURL } from "../../functions";
import { useServers } from "../../states/Servers";

function EditServer({
  closePopUp,
  popUpTarget,
  setPopUpTarget,
}: {
  closePopUp: () => void;
  popUpTarget: string | null;
  setPopUpTarget: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const [assets, setAssets] = useState<string[]>([]);
  const [loadingAssets, setLoadingAssets] = useState<boolean>(false);

  const [submitLoading, setSubmitLoading] = useState<string | false>(false);

  const [serverName, setServerName] = useState<string>("");

  const [serverLogoMode, setServerLogoMode] = useState<string>("select");
  const [serverLogo, setServerLogo] = useState<File | null>(null);
  const [serverLogoSelected, setServerLogoSelected] = useState<string>("");
  const [serverLogoPosition, setServerLogoPosition] = useState<string>("c");

  const [serverBannerMode, setServerBannerMode] = useState<string>("select");
  const [serverBanner, setServerBanner] = useState<File | null>(null);
  const [serverBannerSelected, setServerBannerSelected] = useState<
    string | null
  >("");

  const servers = useServers();

  const loadAssets = () => {
    setLoadingAssets(true);
    axios
      .get(`${getBaseURL()}/assets`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setAssets(res.data.assets);
        setLoadingAssets(false);
      });
  };

  useEffect(() => {
    loadAssets();

    const data = servers.servers.find((server) => server.id === popUpTarget);
    if (!data) return;

    setServerName(data.title);
    setServerLogoMode("select");
    setServerLogoSelected(data.logo);
    setServerLogoPosition(data.logoPosition);

    setServerBannerMode("select");
    setServerBannerSelected(data.banner);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = () => {
    if (!valid()) return;
    setSubmitLoading("Saving...");

    const data = {
      title: serverName,
      logo: serverLogoMode === "upload" ? serverLogo?.name : serverLogoSelected,
      logoPosition: serverLogoPosition,
      banner:
        serverBannerMode === "upload"
          ? serverBanner?.name
          : serverBannerSelected === ""
          ? null
          : serverBannerSelected,
    };

    (async () => {
      if (serverLogoMode === "upload" && serverLogo) {
        setSubmitLoading("Uploading Logo...");

        // file to base64
        const reader = new FileReader();
        reader.readAsDataURL(serverLogo);
        await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
        });

        await axios.post(
          `${getBaseURL()}/assets`,
          {
            name: serverLogo.name,
            data: reader.result,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      if (serverBannerMode === "upload" && serverBanner) {
        setSubmitLoading("Uploading Banner...");

        // file to base64
        const reader = new FileReader();
        reader.readAsDataURL(serverBanner);
        await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
        });

        await axios.post(
          `${getBaseURL()}/assets`,
          {
            name: serverBanner.name,
            data: reader.result,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      setSubmitLoading("Saving Server...");
      axios
        .patch(`${getBaseURL()}/servers/${popUpTarget}`, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then(() => {
          servers.fetchServers();
          setSubmitLoading(false);
          closePopUp();
        })
        .catch((e) => {
          setSubmitLoading(false);
          alert(e.response.data.message);
        });
    })();
  };

  const valid = () => {
    if (serverName.length < 3) return false;
    if (serverLogoMode === "upload" && !serverLogo) return false;
    if (serverLogoMode === "select" && serverLogoSelected === "") return false;
    if (serverBannerMode === "upload" && !serverBanner) return false;
    return true;
  };

  return (
    <Backdrop
      open
      sx={{
        zIndex: 1000,
      }}
    >
      <Backdrop
        open={Boolean(submitLoading)}
        sx={{
          zIndex: 2000,

          display: "flex",
          flexDirection: "column",
        }}
      >
        <CircularProgress color="inherit" />
        <Typography>{submitLoading}</Typography>
      </Backdrop>
      <Box
        sx={{
          width: "500px",
          height: "auto",
          backgroundColor: "#202020",
          boxShadow: "10px 10px 10px #00000055",

          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",

          padding: "20px",
        }}
      >
        <Typography
          sx={{
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          Add Server
        </Typography>

        <Box
          sx={{
            width: "100%",
            height: "auto",

            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",

            mt: "1rem",
          }}
        >
          <TextField
            label="Server Name"
            variant="outlined"
            size="small"
            sx={{
              width: "100%",
            }}
            value={serverName}
            onChange={(e) => {
              if (e.target.value.length >= 50) return;
              setServerName(e.target.value);
            }}
          />

          <Divider sx={{ width: "100%", mt: "1rem" }}> Logo </Divider>

          <ButtonGroup sx={{ mt: "1rem", width: "100%" }}>
            <UploadButton
              variant={serverLogoMode === "upload" ? "contained" : "outlined"}
              sx={{ width: "100%" }}
              onClick={() => setServerLogoMode("upload")}
              onUpload={(file) => {
                if (!file) return setServerLogoMode("select");
                console.log(file);
                setServerLogo(file);
              }}
            >
              Select
            </UploadButton>
            <Button
              variant={serverLogoMode === "select" ? "contained" : "outlined"}
              sx={{ width: "100%" }}
              onClick={() => {
                setServerLogoMode("select");
                loadAssets();
              }}
            >
              Select
            </Button>
          </ButtonGroup>

          {serverLogoMode === "upload" && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <FileOpen sx={{ mr: "0.5rem" }} />
              <Typography
                sx={{
                  color: "#ffffff",
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  margin: "none",

                  maxWidth: "350px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {serverLogo?.name}
              </Typography>
            </Box>
          )}
          {serverLogoMode === "select" && (
            <Autocomplete
              disablePortal
              disableClearable
              size="small"
              loading={loadingAssets}
              loadingText="Loading Assets..."
              options={assets.map((asset) => ({
                label: asset,
                value: asset,
              }))}
              value={{ label: serverLogoSelected, value: serverLogoSelected }}
              onChange={(e, v) => {
                if (!v) return;
                setServerLogoSelected(v.value);
              }}
              sx={{ width: "100%", mt: "1rem" }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Server Logo"
                  variant="outlined"
                  size="small"
                />
              )}
            />
          )}

          <ButtonGroup sx={{ mt: "1rem", width: "100%" }}>
            <Button
              variant={serverLogoPosition === "l" ? "contained" : "outlined"}
              sx={{ width: "100%" }}
              size="small"
              onClick={() => setServerLogoPosition("l")}
            >
              Left
            </Button>
            <Button
              variant={serverLogoPosition === "c" ? "contained" : "outlined"}
              sx={{ width: "100%" }}
              size="small"
              onClick={() => setServerLogoPosition("c")}
            >
              Center
            </Button>
            <Button
              variant={serverLogoPosition === "r" ? "contained" : "outlined"}
              sx={{ width: "100%" }}
              size="small"
              onClick={() => setServerLogoPosition("r")}
            >
              Right
            </Button>
          </ButtonGroup>

          <Divider sx={{ width: "100%", mt: "1rem" }}> Banner </Divider>

          <ButtonGroup sx={{ mt: "1rem", width: "100%" }}>
            <UploadButton
              variant={serverBannerMode === "upload" ? "contained" : "outlined"}
              sx={{ width: "100%" }}
              onClick={() => setServerBannerMode("upload")}
              onUpload={(file) => {
                if (!file) return setServerBannerMode("select");
                console.log(file);
                setServerBanner(file);
              }}
            >
              Select
            </UploadButton>
            <Button
              variant={serverBannerMode === "select" ? "contained" : "outlined"}
              sx={{ width: "100%" }}
              onClick={() => {
                setServerBannerMode("select");
                loadAssets();
              }}
            >
              Select
            </Button>
          </ButtonGroup>

          {serverBannerMode === "upload" && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <FileOpen sx={{ mr: "0.5rem" }} />
              <Typography
                sx={{
                  color: "#ffffff",
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  margin: "none",

                  maxWidth: "350px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {serverBanner?.name}
              </Typography>
            </Box>
          )}
          {serverBannerMode === "select" && (
            <Autocomplete
              disablePortal
              disableClearable
              size="small"
              loading={loadingAssets}
              loadingText="Loading Assets..."
              options={[
                { label: "None", value: null },
                ...assets.map((asset) => ({
                  label: asset,
                  value: asset,
                })),
              ]}
              value={{
                label: serverBannerSelected ?? "None",
                value: serverBannerSelected,
              }}
              onChange={(e, v) => {
                if (!v) return;
                setServerBannerSelected(v.value);
              }}
              sx={{ width: "100%", mt: "1rem" }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Server Banner"
                  variant="outlined"
                  size="small"
                />
              )}
            />
          )}

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
      </Box>
    </Backdrop>
  );
}

export default EditServer;
