import {
  Autocomplete,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { useGeneralState } from "../../states/GeneralState";
import { useEffect, useState } from "react";
import axios from "axios";
import { getBaseURL } from "../../functions";

function Settings({ closePopUp }: { closePopUp: () => void }) {
  const generalData = useGeneralState();

  const [assets, setAssets] = useState<string[]>([]);
  const [loadingAssets, setLoadingAssets] = useState<boolean>(false);

  const [submitLoading, setSubmitLoading] = useState<string | false>(false);

  const [title, setTitle] = useState<string>(generalData.title);
  const [subtitle, setSubtitle] = useState<string>(generalData.subtitle);
  const [banner, setBanner] = useState(generalData.banner);
  const [wallpaper, setWallpaper] = useState(generalData.wallpaper);

  const loadAssets = () => {
    setLoadingAssets(true);
    setSubmitLoading("Loading assets...");
    axios
      .get(`${getBaseURL()}/assets`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setAssets(res.data.assets);
        setLoadingAssets(false);
        setSubmitLoading(false);
      });
  };

  const valid = () => {
    if (title.length < 3) return false;

    return true;
  };

  const submit = async () => {
    await axios.patch(
      `${getBaseURL()}/general`,
      {
        title,
        subtitle,
        banner: banner ?? null,
        wallpaper: wallpaper ?? null,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    generalData.fetchData();
    closePopUp();
  };

  useEffect(() => {
    loadAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",

          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",

            width: "100%",
            maxWidth: "500px",
            backgroundColor: "#202020",
            borderRadius: "10px",
            padding: "1rem",

            gap: "10px",
          }}
        >
          <h1>Settings</h1>

          <TextField
            label="Title"
            variant="outlined"
            size="small"
            sx={{
              width: "100%",
            }}
            value={title}
            onChange={(e) => {
              if (e.target.value.length >= 50) return;
              setTitle(e.target.value);
            }}
          />
          <TextField
            label="Subtitle"
            variant="outlined"
            size="small"
            sx={{
              width: "100%",
            }}
            value={subtitle}
            onChange={(e) => {
              if (e.target.value.length >= 50) return;
              setSubtitle(e.target.value);
            }}
          />

          <Divider sx={{ width: "100%", mt: "1rem" }}> Banner </Divider>

          <Autocomplete
            disablePortal
            disableClearable
            size="small"
            loading={loadingAssets}
            loadingText="Loading Assets..."
            options={[
              { label: "none", value: undefined },
              ...assets.map((asset) => ({
                label: asset,
                value: asset,
              })),
            ]}
            value={{ label: banner ?? "None", value: banner }}
            onChange={(e, v) => {
              if (!v) return;
              setBanner(v.value);
            }}
            sx={{ width: "100%", mt: "1rem" }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Banner"
                variant="outlined"
                size="small"
              />
            )}
          />

          <Divider sx={{ width: "100%", mt: "1rem" }}> Wallpaper </Divider>

          <Autocomplete
            disablePortal
            disableClearable
            size="small"
            loading={loadingAssets}
            loadingText="Loading Assets..."
            options={[
              { label: "none", value: undefined },
              ...assets.map((asset) => ({
                label: asset,
                value: asset,
              })),
            ]}
            value={{ label: wallpaper ?? "None", value: wallpaper }}
            onChange={(e, v) => {
              if (!v) return;
              setWallpaper(v.value);
            }}
            sx={{ width: "100%", mt: "1rem" }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Wallpaper"
                variant="outlined"
                size="small"
              />
            )}
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
      </Box>
    </Backdrop>
  );
}

export default Settings;
