import {
  Box,
  Fab,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import Service from "./Service";
import { useState } from "react";
import {
  AddLink,
  Close,
  Delete,
  DragIndicator,
  Edit,
  Height,
} from "@mui/icons-material";
import { getBaseURL } from "../functions";
import { useServers } from "../states/Servers";
import axios from "axios";

function Server({
  id,
  title,
  logo,
  logoPosition,
  banner,
  services,
  position,
  editMode,
  draggedServer,
  setDraggedServer,
  setPopUpState,
  setPopUpTarget,
}: {
  editMode: boolean;
  draggedServer: string | false;
  setDraggedServer: (id: string | false) => void;
  setPopUpState: React.Dispatch<React.SetStateAction<string>>;
  setPopUpTarget: React.Dispatch<React.SetStateAction<string | null>>;
} & Types.Server) {
  const [hovered, setHovered] = useState(false);
  const servers = useServers();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuService, setMenuService] = useState<Types.Service | null>(null);
  const open = Boolean(anchorEl);

  const [draggingService, setDraggingService] = useState<Types.Service | false>(
    false
  );

  return (
    <Grid
      item
      key={id}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",

        width: "350px",
        height: "auto",
        backgroundColor: "#202020",

        boxShadow: "10px 10px 10px #00000055",
        transition: "all 0.5s ease",

        ...(draggedServer === id && {
          opacity: 0.5,
          border: "2px dashed #ffffff",
        }),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Tooltip title="Cancel Moving" placement="left" arrow>
        <Fab
          sx={{
            position: "absolute",
            bottom: "50px",
            right: "50px",
            visibility: draggedServer || draggingService ? "visible" : "hidden",
          }}
          color="error"
        >
          <Close
            sx={{ color: "#ffffff" }}
            onClick={() => {
              setDraggedServer(false);
              setDraggingService(false);
              setMenuService(null);
            }}
          />
        </Fab>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => {
          setAnchorEl(null);
          setMenuService(null);
        }}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem
          onClick={() => {
            setPopUpState("editService");
            setPopUpTarget(menuService?.id || null);
            setAnchorEl(null);
            setMenuService(null);
          }}
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (!menuService) return;

            setDraggingService(menuService);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <Height fontSize="small" />
          </ListItemIcon>
          <ListItemText>Move</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (!menuService) return;

            servers.removeService(menuService);
            setAnchorEl(null);
            setMenuService(null);
          }}
        >
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: logo,

          width: "100%",
          height: "100px",
          background: `linear-gradient(45deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),url('${getBaseURL().replace(
            "/api",
            ""
          )}/assets/${encodeURIComponent(banner)}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",

          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "25px",
            backgroundColor: "#101010",

            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",

            marginTop: (hovered && editMode) || draggedServer ? "0px" : "-40px",
            opacity: (hovered && editMode) || draggedServer ? 1 : 0,
            transition: "all 0.5s ease",
          }}
        >
          <IconButton
            size="small"
            sx={{
              color: "#ffffff",
              backgroundColor: "#00000055",
              margin: "0.5rem",
            }}
            onClick={() => {
              console.log("Drag");
              if (draggedServer === id) return setDraggedServer(false);

              if (draggedServer) {
                servers.swapPositions(draggedServer, id);
                return setDraggedServer(false);
              }

              setDraggedServer(id);
            }}
          >
            <DragIndicator fontSize="small" />
          </IconButton>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconButton
              size="small"
              sx={{
                color: "#ffffff",
                backgroundColor: "#00000055",
                margin: "0.5rem",
              }}
              onClick={() => {
                console.log("Edit");
                setPopUpTarget(id);
                setPopUpState("editServer");
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              sx={{
                color: "#ffffff",
                backgroundColor: "#00000055",
                margin: "0.5rem",
              }}
              onClick={() => {
                console.log("Delete");
                axios.delete(`${getBaseURL()}/servers/${id}`, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }).then(() => {
                  servers.fetchServers();
                })
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <img
          alt=""
          src={`${getBaseURL().replace("/api", "")}/assets/${logo}`}
          style={{
            display: "block",
            height: "50px",
            marginTop: (hovered && editMode) || draggedServer ? "0px" : "40px",
            transition: "all 0.5s ease",
          }}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",

          width: "100%",
          height: "auto",
        }}
      >
        <Box
          sx={{
            height: "25px",
            width: "100%",
            backgroundColor: "#00000055",

            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",

            borderBottom: "1px solid #fff",
          }}
        >
          <Typography
            sx={{
              color: "#ffffff",
              fontWeight: "bold",
              fontSize: "0.9rem",
            }}
          >
            {title}
          </Typography>
        </Box>
        <Box
          sx={{
            width: "100%",
            height: "auto",
          }}
        >
          {services.map((service) => (
            <Service
              {...{
                id: service.id,
                title: service.title,
                subtitle: service.subtitle,
                icon: service.icon,
                link: service.link,
                position: service.position,
                server: id,
                editMode,
                onOptions: (e, s) => {
                  setAnchorEl(e.currentTarget);
                  setMenuService(s);
                },
                draggingService,
                setDraggingService,
              }}
            />
          ))}
          <Box
            sx={{
              width: editMode && !draggingService ? "100%" : "0px",
              opacity: editMode && !draggingService ? 1 : 0,
              height: editMode && !draggingService ? "25px" : "0px",

              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",

              border: "1px dashed #ffffff",
              overflow: "hidden",
              transition: "all 0.5s ease",

              cursor: "pointer",
              pointerEvents: editMode ? "all" : "none",
            }}
            onClick={() => {
              setPopUpState("addService");
              setPopUpTarget(id);
            }}
          >
            <AddLink sx={{ color: "#ffffff" }} />
          </Box>
        </Box>
      </Box>
    </Grid>
  );
}

export default Server;
