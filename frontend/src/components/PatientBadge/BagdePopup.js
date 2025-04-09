import { Document, Page } from "react-pdf";
import { BadgePopupBox } from "../styles/DashboardComponents.styled";
import React, { useEffect, useRef, useState, useMemo } from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Fab } from "@mui/material";


/**
 * 
 * @param props onClose function, open state variable 
 * @returns Badge popup
 */
export function BadgePopup(props) {
  const { onClose, value: valueProp, open, ...other } = props;
  const group = props.badgeGroup;
  const exp = props.explanation;

  const handleClose = () => {
    onClose("i");
  };

  // Render badge popup
  return (
    <BadgePopupBox
      onClose={handleClose}
      open={open}
      PaperProps={{
        style: {
          minHeight: "40vh", // Set maximum height
          maxHeight: "40vh",
          minWidth: "45vw",
          maxWidth: "45vw",
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
        Patient Badge
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
          paddingBottom: "2em",
        }}
      >
        <div style={{ textAlign: "center", float: "left" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              height: "30px",
            }}
          >
            <Fab
              disabled
              onClick={() => {}}
              style={{
                height: "7em",
                width: "7em",
                padding: "2em",
                backgroundColor: "transparent",
              }}
            >
              <div className="badge" style={{ transform: "scale(2)" }}>
                {group}
              </div>
            </Fab>

            <p style={{ marginLeft: "3em", fontSize: "0.8em" }}>{exp}</p>
          </div>
        </div>
      </DialogContent>
      <DialogActions></DialogActions>
    </BadgePopupBox>
  );
}
