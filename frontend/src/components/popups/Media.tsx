import {
  Backdrop,
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { getBaseURL } from "../../functions";
import { Close, Upload } from "@mui/icons-material";
import UploadButton from "../UploadButton";

function Media({ closePopUp }: { closePopUp: () => void }) {
  const [assets, setAssets] = useState<string[]>([]);
  const [loading, setLoading] = useState<string | false>(false);

  const loadAssets = () => {
    setLoading("Loading assets...");
    axios
      .get(`${getBaseURL()}/assets`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setAssets(res.data.assets);
        setLoading(false);
      });
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

            width: "auto",
            minWidth: "500px",
            backgroundColor: "#202020",
            borderRadius: "10px",
            padding: "1rem",

            gap: "10px",
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              px: "1rem",
              py: "0.5rem",
            }}
          >
            <UploadButton
              onUpload={async (file) => {
                if (!file) return;
                setLoading(`Uploading ${file.name}...`);
                // file to base64
                const reader = new FileReader();
                reader.readAsDataURL(file);
                await new Promise((resolve) => {
                  reader.onload = () => resolve(reader.result);
                });

                await axios.post(
                  `${getBaseURL()}/assets`,
                  {
                    name: file.name,
                    data: reader.result,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }
                );
                loadAssets();
              }}
              sx={{
                mr: "auto",
              }}
            >
              <Upload onClick={closePopUp} />
            </UploadButton>
            <h1
              style={{
                marginLeft: "auto",
                position: "absolute",
              }}
            >
              Assets
            </h1>
            <IconButton
              sx={{
                ml: "auto",
              }}
            >
              <Close onClick={closePopUp} />
            </IconButton>
          </Box>
          <Box
            sx={{
              height: "auto",
              maxHeight: "80vh",
              whiteSpace: "nowrap",
              overflowY: "auto",
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="left"></TableCell>
                  <TableCell align="left"></TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset}>
                    <TableCell align="left" padding="checkbox">
                      <img
                        src={`${getBaseURL().replace(
                          "/api",
                          ""
                        )}/assets/${encodeURIComponent(asset)}`}
                        alt=""
                        style={{
                          height: "50px",
                          width: "50px",
                          objectFit: "contain",
                        }}
                      />
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        maxWidth: "600px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {asset}
                    </TableCell>
                    <TableCell align="right">
                      <Grid container spacing={1}>
                        {/* <Grid item>
                        <Typography
                          sx={{
                            color: "#ffffff",
                            fontWeight: "bold",
                            fontSize: "0.75rem",
                            margin: "none",

                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        >
                          Rename
                        </Typography>
                      </Grid> */}
                        <Grid
                          item
                          sx={{
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setLoading("Deleting asset...");
                            axios
                              .delete(`${getBaseURL()}/assets/${asset}`, {
                                headers: {
                                  Authorization: `Bearer ${localStorage.getItem(
                                    "token"
                                  )}`,
                                },
                              })
                              .then(() => {
                                loadAssets();
                              });
                          }}
                        >
                          <Typography
                            sx={{
                              color: "#ffffff",
                              fontWeight: "bold",
                              fontSize: "0.75rem",
                              margin: "none",
                              userSelect: "none",
                            }}
                          >
                            Delete
                          </Typography>
                        </Grid>
                      </Grid>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Box>
      </Box>
    </Backdrop>
  );
}

export default Media;
