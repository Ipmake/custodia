import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { useGeneralState } from "../states/GeneralState";
import { useEffect, useState } from "react";
import {
  AddCard,
  Edit,
  FileOpen,
  Person,
  Save,
  Settings,
} from "@mui/icons-material";
import Server from "../components/Server";
import { useServers } from "../states/Servers";
import Popup from "../components/Popup";
import { getBaseURL } from "../functions";

function Dashboard() {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [popUpState, setPopUpState] = useState<string>("none");
  const [popUpTarget, setPopUpTarget] = useState<string | null>(null);

  const data = useGeneralState();
  const servers = useServers();

  const [draggedServer, setDraggedServer] = useState<string | false>(false);

  useEffect(() => {
    if (!data.loaded) {
      servers.fetchServers();
      data.fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data.loaded)
    return (
      <Backdrop
        open={true}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <CircularProgress color="inherit" />
        <Typography>Loading</Typography>
      </Backdrop>
    );

  return (
    <>
      <Popup {...{ popUpState, setPopUpState, popUpTarget, setPopUpTarget }} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",

          width: "100%",
          height: "100vh",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",

            width: "100%",
            backgroundColor: "#202020",
            ...(data.banner && {
              background:
                data.banner &&
                `linear-gradient(45deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),url('${getBaseURL().replace(
                  "/api",
                  ""
                )}/assets/${encodeURIComponent(data.banner)}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }),
            padding: "1rem",
            margin: "1rem",
            py: "2rem",
            my: "2rem",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              left: "1rem",

              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              sx={{
                gap: "0.5rem",
                marginLeft: editMode ? "0.5rem" : "0rem",
                overflow: "hidden",
                opacity: editMode ? 1 : 0,
                pointerEvents: editMode ? "all" : "none",
                transition: "all 0.5s ease",
              }}
              onClick={() => {
                setPopUpState("password");
              }}
            >
              <Person fontSize="small" />
              User
            </Button>
          </Box>

          <Typography
            sx={{
              fontSize: "2rem",
              fontWeight: "bold",
            }}
          >
            {data.title}
          </Typography>
          <Typography
            sx={{
              fontWeight: "light",
              color: "#a0a0a0",
            }}
          >
            {data.subtitle}
          </Typography>

          <Box
            sx={{
              position: "absolute",
              right: "1rem",

              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              sx={{
                gap: "0.5rem",
                marginRight: editMode ? "0.5rem" : "0rem",
                overflow: "hidden",
                opacity: editMode ? 1 : 0,
                pointerEvents: editMode ? "all" : "none",
                transition: "all 0.5s ease",
              }}
              onClick={() => {
                setPopUpState("media");
              }}
            >
              <FileOpen fontSize="small" />
              Assets
            </Button>
            <Button
              variant="outlined"
              sx={{
                gap: "0.5rem",
                marginRight: editMode ? "0.5rem" : "0rem",
                overflow: "hidden",
                opacity: editMode ? 1 : 0,
                pointerEvents: editMode ? "all" : "none",
                transition: "all 0.5s ease",
              }}
              onClick={() => {
                setPopUpState("settings");
              }}
            >
              <Settings fontSize="small" />
              Settings
            </Button>

            <Button
              variant="outlined"
              sx={{
                gap: "0.5rem",
              }}
              onClick={() => {
                setEditMode(!editMode);
              }}
            >
              {editMode ? (
                <>
                  <Save fontSize="small" />
                  Save
                </>
              ) : (
                <>
                  <Edit fontSize="small" />
                  Edit
                </>
              )}
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            width: "100%",
            height: editMode ? "40px" : "0px",
            opacity: editMode ? 1 : 0,
            border: "1px solid #555",
            marginTop: "-20px",
            cursor: "pointer",
            pointerEvents: editMode ? "all" : "none",

            transition: "all 0.5s ease",

            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => {
            setPopUpState("addServer");
          }}
        >
          <AddCard />
        </Box>
        <Grid
          container
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "center",

            width: "100%",
            height: "100%",
            maxHeight: "100%",

            overflowY: "auto",

            gap: "1rem",
            px: "1rem",
            py: "0.5rem",
          }}
        >
          {servers.servers
            .sort((a, b) => a.position - b.position)
            .map((server) => (
              <Server
                {...{
                  ...server,
                  editMode: editMode,
                  draggedServer: draggedServer,
                  setDraggedServer: setDraggedServer,
                  setPopUpState: setPopUpState,
                  setPopUpTarget: setPopUpTarget,
                }}
              />
            ))}
        </Grid>
      </Box>
    </>
  );
}

export default Dashboard;
