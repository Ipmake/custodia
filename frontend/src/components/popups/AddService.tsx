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
import axios from "axios";
import { getBaseURL } from "../../functions";
import { FileOpen } from "@mui/icons-material";
import { useServers } from "../../states/Servers";

function AddService({
  closePopUp,
  popUpTarget,
  setPopUpTarget,
}: {
  closePopUp: () => void;
  popUpTarget: string | null;
  setPopUpTarget: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const servers = useServers();

  const [assets, setAssets] = useState<string[]>([]);
  const [loadingAssets, setLoadingAssets] = useState<boolean>(false);

  const [submitLoading, setSubmitLoading] = useState<string | false>(false);

  const [serviceName, setServiceName] = useState<string>("");
  const [serviceSubtitle, setServiceSubtitle] = useState<string>("");

  const [serviceIconMode, setServiceIconMode] = useState<string>("select");
  const [serviceIcon, setServiceIcon] = useState<File | null>(null);
  const [serviceIconSelected, setServiceIconSelected] = useState<string>("");

  const [serviceLink, setServiceLink] = useState<string>("");

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
  }, []);

  const valid = () => {
    if (!serviceName || serviceName.length < 3) return false;
    if (serviceIconMode === "upload" && !serviceIcon) return false;
    if (serviceIconMode === "select" && !serviceIconSelected) return false;
    if (!serviceLink || serviceLink.length < 3) return false;

    return true;
  };

  const submit = () => {
    if (!valid()) return;
    setSubmitLoading("Saving...");

    const data = {
      title: serviceName,
      subtitle: serviceSubtitle,
      server: popUpTarget,
      icon:
        serviceIconMode === "upload" ? serviceIcon?.name : serviceIconSelected,
      link: serviceLink,
    };

    (async () => {
      if (serviceIconMode === "upload" && serviceIcon) {
        setSubmitLoading("Uploading Icon...");

        // file to base64
        const reader = new FileReader();
        reader.readAsDataURL(serviceIcon);
        await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
        });

        await axios.post(
          `${getBaseURL()}/assets`,
          {
            name: serviceIcon.name,
            data: reader.result,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      setSubmitLoading("Saving Service...");
      axios
        .post(`${getBaseURL()}/service`, data, {
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

  return (
    <Backdrop
      open
      sx={{
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Backdrop
        open={Boolean(submitLoading)}
        sx={{
          zIndex: 1000,

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

          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",

          padding: "20px",
        }}
      >
        <Typography
          sx={{
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          Add Service
        </Typography>

        <Box
          sx={{
            width: "100%",
            height: "auto",

            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: "5px",

            mt: "1rem",
          }}
        >
          <TextField
            label="Title"
            variant="outlined"
            size="small"
            sx={{
              width: "100%",
            }}
            value={serviceName}
            onChange={(e) => {
              if (e.target.value.length >= 32) return;
              setServiceName(e.target.value);
            }}
          />
          <TextField
            label="Subtitle"
            variant="outlined"
            size="small"
            sx={{
              width: "100%",
            }}
            value={serviceSubtitle}
            onChange={(e) => {
              if (e.target.value.length >= 50) return;
              setServiceSubtitle(e.target.value);
            }}
          />
        </Box>

        <Divider sx={{ width: "100%", mt: "1rem" }}> Icon </Divider>

        <ButtonGroup sx={{ mt: "1rem", width: "100%" }}>
          <UploadButton
            variant={serviceIconMode === "upload" ? "contained" : "outlined"}
            sx={{ width: "100%" }}
            onClick={() => setServiceIconMode("upload")}
            onUpload={(file) => {
              if (!file) return setServiceIconMode("select");
              console.log(file);
              setServiceIcon(file);
            }}
          >
            Select
          </UploadButton>
          <Button
            variant={serviceIconMode === "select" ? "contained" : "outlined"}
            sx={{ width: "100%" }}
            onClick={() => {
              setServiceIconMode("select");
              loadAssets();
            }}
          >
            Select
          </Button>
        </ButtonGroup>

        {serviceIconMode === "upload" && (
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
              {serviceIcon?.name}
            </Typography>
          </Box>
        )}
        {serviceIconMode === "select" && (
          <Autocomplete
            disablePortal
            size="small"
            defaultValue={{ label: assets[0], value: assets[0] }}
            loading={loadingAssets}
            loadingText="Loading Assets..."
            options={assets.map((asset) => ({
              label: asset,
              value: asset,
            }))}
            value={{ label: serviceIconSelected, value: serviceIconSelected }}
            onChange={(e, v) => {
              if (!v) return;
              setServiceIconSelected(v.value);
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

        <Divider sx={{ width: "100%", mt: "1rem" }}> Link </Divider>

        <TextField
          label="Link"
          variant="outlined"
          size="small"
          sx={{
            width: "100%",
            mt: "1rem",
          }}
          value={serviceLink}
          onChange={(e) => {
            setServiceLink(e.target.value);
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

export default AddService;
