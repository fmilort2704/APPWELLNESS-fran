import React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { BadgePopupBox } from "../styles/DashboardComponents.styled";
import { ListItemButton, ListItemIcon } from "@mui/material";
import FileOpenIcon from "@mui/icons-material/FileOpen";

// Popup to display export options for both CSV and JSON
export function ExportPopup(props) {
  const { onClose, value: valueProp, open, ...other } = props;
  const downloadJSON = props.downloadJSON;
  const downloadCSV = props.downloadCSV;
  const handleClose = () => {
    onClose("i");
  };

  return (
    <BadgePopupBox
      onClose={handleClose}
      open={open}
      PaperProps={{
        style: {
          minHeight: "30vh", // Set maximum height
          maxHeight: "30vh",
          minWidth: "35vw",
          maxWidth: "35vw",
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          textAlign: "center",
          fontSize: "1em",
          fontFamily: "Palanquin Dark",
        }}
      >
        Select Export Option
      </DialogTitle>
      <IconButton
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent
        style={{
          paddingLeft: "2em",
          paddingRight: "2em",
        }}
      >
        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          <div>
            <ListItemButton
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#423F43",
              }}
              onClick={downloadCSV}
            >
              <ListItemIcon
                style={{
                  alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  color: props.selectedTheme.colors.headertext,
                }}
              >
                <FileOpenIcon sx={{ fontSize: "1.6em" }} />
                <h5 style={{ textAlign: "center", fontSize: "0.8em" }}>CSV</h5>
              </ListItemIcon>
            </ListItemButton>
          </div>
          <div>
            <ListItemButton
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#423F43",
              }}
              onClick={downloadJSON}
            >
              <ListItemIcon
                style={{
                  alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  color: props.selectedTheme.colors.headertext,
                }}
              >
                <FileOpenIcon sx={{ fontSize: "1.6em" }} />
                <h5 style={{ textAlign: "center", fontSize: "0.8em" }}>JSON</h5>
              </ListItemIcon>
            </ListItemButton>
          </div>
        </div>
      </DialogContent>
      <DialogActions></DialogActions>
    </BadgePopupBox>
  );
}
