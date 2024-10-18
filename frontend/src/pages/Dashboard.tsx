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
import { AddCard, Edit, Save } from "@mui/icons-material";
import Server from "../components/Server";
import { useServers } from "../states/Servers";
import Popup from "../components/Popup";

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
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",

            width: "100%",
            height: "100vh",
            backgroundColor: "#202020",
            padding: "1rem",
            margin: "1rem",
          }}
        >
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

          <Button
            variant="outlined"
            sx={{
              position: "absolute",
              right: "1rem",
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
          {servers.servers.sort((a, b) => a.position - b.position).map((server) => (
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
