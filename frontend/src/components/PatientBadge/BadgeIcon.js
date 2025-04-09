import * as React from "react";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import FavoriteIcon from "@mui/icons-material/Favorite";
import NavigationIcon from "@mui/icons-material/Navigation";
import CachedIcon from "@mui/icons-material/Cached";
import { useState, useEffect } from "react";
import { BadgePopup } from "./BagdePopup";
import { IconButton } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ReactLoading from "react-loading";
import ShieldIcon from "@mui/icons-material/Shield";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import {
  forecastModel,
  groupModel,
  groupShap,
} from "../../utility/apiCommunicator";


/**
 * 
 * @param {theme} theme Currently selected theme 
 * @param {name} param0 Name of patient
 * @param {userID} param0 ID of patient
 * @returns 
 */

export default function BadgeIcon({ theme, name, userID }) {
  const [showBadgePopuop, setshowBadgePopuop] = useState(false); //holds state of visibility of popup

  const handleBadgeButton = () => {
    setshowBadgePopuop(!showBadgePopuop);
  };

  const [group, setGroup] = useState(
    <div style={{ margin: "auto" }}>
      {" "}
      <ReactLoading type={"bubbles"} color={"unset"} />{" "}
    </div>
  );
  var hasGroup = false;

  const [explain, setExplain] = useState("Loading...");

  //setting the badge
  useEffect(() => {
    if (!hasGroup && name !== "" && userID !== "") {
      hasGroup = true;
      let shieldColor;

      groupModel(userID).then((r) => {
        switch (r) {
          case "A":
            shieldColor = "#59F9DA";
            break;
          case "B":
            shieldColor = "#63E654";
            break;
          case "C":
            shieldColor = "#EDF255";
            break;
          case "D":
            shieldColor = "#f3a657";
            break;
          case "E":
            shieldColor = "#F95959";
            break;
          default:
            shieldColor = "#FFFFFF";
            break;
        }
        setGroup(
          <div style={{ position: "relative" }}>
            <ShieldOutlinedIcon
              style={{
                height: "65px",
                margin: "auto",
                fontSize: "84px",
                top: 10,
                position: "relative",
                color: "white",
              }}
            />
            <ShieldIcon
              style={{
                position: "absolute",
                height: "50px",
                top: "18px",
                left: "10px",
                zIndex: "-1",
                fontSize: "64px",
                color: shieldColor,
              }}
            />
            <p
              style={{
                fontSize: "26px",
                margin: "auto",
                position: "absolute",
                top: "18px",
                left: "33px",
                fontFamily: "Raleway",
                fontWeight: "bold",
              }}
            >
              {" "}
              {r}
            </p>
          </div>
        );
      });

      groupShap(userID).then((r) => {
        console.log("shap r:" + r);
        setExplain(r);
      });
    }
  }, []);

  // Rendering of Badge 
  return (
    <Box sx={{ m: 3 }}>
      <Fab
        onClick={handleBadgeButton}
        style={{
          height: "7em",
          width: "7em",
          padding: "2em",
          backgroundColor: theme.colors.cardHolders,
        }}
      >
        <div className="badge">
          {group}
          <BadgePopup
            open={showBadgePopuop}
            onClose={handleBadgeButton}
            badgeGroup={getBadge()}
            explanation={getBadgeInfo()}
          />
        </div>
      </Fab>
    </Box>
  );
  
  // 
  function getBadgeInfo() {
    return explain;
  }

  function getBadge() {
    return group;
  }
}
