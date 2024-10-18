import { KeyboardArrowDown, MoreHoriz, OpenInNew } from "@mui/icons-material";
import { Avatar, Box, IconButton, Typography } from "@mui/material";
import { getBaseURL } from "../functions";
import { useServers } from "../states/Servers";

function Service({
  id,
  title,
  subtitle,
  icon,
  link,
  position,
  server,
  editMode,
  onOptions,
  draggingService,
  setDraggingService,
}: {
  server: string;
  editMode: boolean;
  onOptions: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    service: Types.Service
  ) => void;
  draggingService: Types.Service | false;
  setDraggingService: (service: Types.Service | false) => void;
} & Types.Service) {
  const servers = useServers();

  const showDragField =
    editMode &&
    draggingService !== false &&
    draggingService?.id !== id &&
    draggingService?.position + 1 !== position;
  const showDragFieldBelow =
    editMode &&
    draggingService !== false &&
    draggingService?.id !== id &&
    position ===
      (servers.servers.find((s) => s.id === server) as Types.Server).services
        .length -
        1;
  return (
    <Box
      sx={{
        width: "100%",
        height: () => {
          let size = 50;
          if (showDragField) size += 25;
          if (showDragFieldBelow) size += 25;
          return `${size}px`;
        },

        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#00000055",
        padding: "10px",
        transition: "all 0.5s ease",
      }}
    >
      <Box
        sx={{
          height: showDragField ? "25px" : "0px",
          opacity: showDragField ? 1 : 0,
          cursor: "pointer",
          pointerEvents: showDragField ? "all" : "none",
          width: "100%",

          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",

          border: "1px dashed #fff",
          transition: "all 0.5s ease",
        }}
        onClick={async () => {
          if (draggingService === false || draggingService.id === id) return;
          await servers.moveService(
            servers.servers.find((s) => s.id === server) as Types.Server,
            draggingService,
            position
          );
          setDraggingService(false);
        }}
      >
        <KeyboardArrowDown />
      </Box>
      <Box
        sx={{
          width: "100%",
          height: "50px",

          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",

          filter:
            draggingService !== false && draggingService?.id === id
              ? "brightness(0.5)"
              : "",
        }}
      >
        <Avatar
          src={`${getBaseURL().replace("/api", "")}/assets/${icon}`}
          sx={{
            width: "40px",
            height: "40px",
            backgroundColor: "#00000000",
          }}
          variant="square"
          imgProps={{
            style: {
              objectFit: "contain",
            },
          }}
        >
          -
        </Avatar>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: "none",
            ml: "20px",
          }}
        >
          <Typography
            sx={{
              color: "#ffffff",
              fontWeight: "bold",
              fontSize: "0.75rem",
              margin: "none",

              maxWidth: "230px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              color: "#ffffff",
              fontWeight: "light",
              fontSize: "0.6rem",
              margin: "none",

              maxWidth: "230px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",

              ...((subtitle === "" || !subtitle) && {
                display: "none",
              }),
            }}
          >
            {subtitle}
          </Typography>
        </Box>

        {editMode && (
          <IconButton
            size="small"
            sx={{
              ml: "auto",
            }}
            onClick={(e) => {
              onOptions(e, {
                id,
                title,
                subtitle,
                icon,
                link,
                position,
              } as Types.Service);
            }}
          >
            <MoreHoriz />
          </IconButton>
        )}
        {!editMode && (
          <IconButton
            size="small"
            sx={{
              ml: "auto",
            }}
            href={link}
            target="_blank"
            rel="noreferrer"
          >
            <OpenInNew />
          </IconButton>
        )}
      </Box>
      <Box
        sx={{
          height: showDragFieldBelow ? "25px" : "0px",
          opacity: showDragFieldBelow ? 1 : 0,
          cursor: "pointer",
          pointerEvents: showDragFieldBelow ? "all" : "none",
          width: "100%",

          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",

          border: "1px dashed #fff",
          transition: "all 0.5s ease",
        }}
        onClick={async () => {
          if (draggingService === false || draggingService.id === id) return;
          await servers.moveService(
            servers.servers.find((s) => s.id === server) as Types.Server,
            draggingService,
            (servers.servers.find((s) => s.id === server) as Types.Server)
              .services.length-1
          );
          setDraggingService(false);
        }}
      >
        <KeyboardArrowDown />
      </Box>
    </Box>
  );
}

export default Service;
