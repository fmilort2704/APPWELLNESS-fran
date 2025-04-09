import { AiFillCaretLeft } from "react-icons/ai";
import "./Header.css";
import styled from "styled-components";
import {
  ToolbarThemed,
  SidebarThemed,
} from "../styles/DashboardComponents.styled";
import { GlobalStyles } from "../styles/Global";
import { useState, useEffect } from "react";
import * as React from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { Divider, Drawer } from "@mui/material";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpIcon from "@mui/icons-material/Help";
import FeedbackIcon from "@mui/icons-material/Feedback";
import LogoutIcon from "@mui/icons-material/Logout";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { jsPDF } from "jspdf";
import { ConfirmationDialogRaw } from "../Sidebar/Settings";
import {
  highcon,
  dark,
  blue,
  green,
} from "../../components/styles/Theme.styled";
import { ThemeProvider } from "styled-components";
import { icons } from "react-icons/lib";
import { LegendToggleRounded } from "@mui/icons-material";
import { HelpGuide } from "../Sidebar/Help";
import Axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { ExportPopup } from "../ExportPopup/ExportPopup";
import ReactLoading from "react-loading";
import ShieldIcon from "@mui/icons-material/Shield";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { groupModel } from "../../utility/apiCommunicator";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { BadgePopup } from "../PatientBadge/BagdePopup";
import { AlertBox } from "../Sidebar/Alert";

function Export() {
  var doc = new jsPDF("p", "pt", "a4");
  var source = window.document.getElementsByClassName("Dashboard-Body")[0];
  doc.html(source, {
    callback: function (doc) {
      doc.save();
    },
    width: 700,
    windowWidth: 1920,
    // html2canvas:  { dpi: 600, letterRendering: true, width: 1080, height: 1920}
  });
}

const downloadFile = ({ data, fileName, fileType }) => {
  const blob = new Blob([data], { type: fileType });
  // download on click:
  const doc = document.createElement("a");
  doc.download = fileName;
  doc.href = window.URL.createObjectURL(blob);
  const clickEvt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  doc.dispatchEvent(clickEvt);
  doc.remove();
};


/**
 * 
 * @param {name} name Name of patient 
 * @param {userID} userID ID of patient
 * @param {navigateReturn} navigateReturn function navigating to Patient Select screen
 * @param {selectedTheme} selectedTheme currently selected theme
 * @param {setSelectedTheme} setSelectedTheme function to set current theme
 * @returns Header with Sidebar functionality
 * 
 */
export function Header({
  name,
  userID,
  navigateReturn,
  selectedTheme,
  setSelectedTheme,
  institutionName,
}) {
  const [userData, setUserData] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [showAlertPopup, setshowAlertPopup] = useState(false); //holds visiblity state of alert popup

  const [showExportPopup, setShowExportPopup] = useState(false); //holds visiblity state of export popup

  const handleExportButton = () => {
    setShowExportPopup(!showExportPopup);
  };

  const handleAlertButton = () => {
    setshowAlertPopup(!showAlertPopup);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("institution");
    localStorage.removeItem("clinicianId");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("institutionId");
    navigate("/");
  };

  useEffect(() => {
    if (name !== "") {
      const fetchDataWrapper = async () => {
        try {
          let params = {
            id: location.state.id,
          };

          const apiUrl =
            process.env.NODE_ENV === "production"
              ? `/api/all_ap_user_data`
              : `http://localhost:5001/api/all_ap_user_data`;

          const [userDataResponse] = await Promise.all([
            Axios.get(apiUrl, { params }),
          ]);
          setUserData(userDataResponse.data);
        } catch (error) {
          console.error("API request error:", error);
        }

        const currentTheme = JSON.parse(localStorage.getItem("currentTheme"));

        if (currentTheme) {
          setSelectedTheme(currentTheme);
        }
      };
      fetchDataWrapper();
    }
  }, [name, setSelectedTheme]);

  function DownloadJSON() {
    downloadFile({
      data: JSON.stringify(userData),
      fileName: "user_id_" + userData[0].user_id + "'s_data.json",
      fileType: "text/json",
    });
  }

  function DownloadCSV() {
    let headers = [
      "user_id,sleep_target,sleep_value,steps,calories_target,calories_value,intensity,min_heart_rate,max_heart_rate,data_created_at,data_updated_at,data_created_by_id,data_updated_by_id,daily_step_goal",
    ];
    // Convert users data to a csv
    let usersCsv = userData.reduce((acc, user) => {
      const {
        user_id,
        sleep_target,
        sleep_value,
        steps,
        calories_target,
        calories_value,
        intensity,
        min_heart_rate,
        max_heart_rate,
        data_created_at,
        data_updated_at,
        data_created_by_id,
        data_updated_by_id,
        daily_step_goal,
      } = user;
      acc.push(
        [
          user_id,
          sleep_target,
          sleep_value,
          steps,
          calories_target,
          calories_value,
          intensity,
          min_heart_rate,
          max_heart_rate,
          data_created_at,
          data_updated_at,
          data_created_by_id,
          data_updated_by_id,
          daily_step_goal,
        ].join(",")
      );
      return acc;
    }, []);
    downloadFile({
      data: [...headers, ...usersCsv].join("\n"),
      fileName: "user_id_" + userData[0].user_id + "'s_data.csv",
      fileType: "text/csv",
    });
  }

  const [open, setOpen] = useState(false); //holds visiblity state of sidebar


  const toggleBar = () => {
    if (open) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  let title;
  let exportButton;
  let exitButton;
  if (name === "") {
    title = (
      <h2 className={"HeaderFont"} style={{ float: "left", fontSize: "0.4em" }}>
        Selected User {userID}
      </h2>
    );
  } else {
    title = (
      <h2 className={"HeaderFont"} style={{ float: "left", fontSize: "0.4em" }}>
        <div
          style={{
            alignContent: "center",
            alignItems: "center",
            display: "flex",
          }}
        >
          <AccountCircleIcon
            style={{
              marginRight: "10px",
              fontSize: "1.2em",
            }}
          />
          {name}
        </div>
      </h2>
    );
    
    // Renders export functionality
    exportButton = (
      <>
        <ListItem style={{ marginTop: "0.5em", marginBottom: "0.5em" }}>
          <ListItemButton
            style={{
              display: "flex",
              flexDirection: "column",
              color: selectedTheme.colors.headertext,
            }}
            onClick={handleExportButton}
          >
            <ExportPopup
              open={showExportPopup}
              onClose={handleExportButton}
              downloadJSON={DownloadJSON}
              downloadCSV={DownloadCSV}
              selectedTheme={selectedTheme}
            />
            <ListItemIcon
              style={{
                alignSelf: "center",
                justifyContent: "center",
                alignItems: "center",
                color: selectedTheme.colors.headertext,
              }}
            >
              <FileOpenIcon sx={{ fontSize: "1.3em" }} />
            </ListItemIcon>{" "}
            <h4 style={{ textAlign: "center", fontSize: "0.7em" }}>
              Export Data
            </h4>
          </ListItemButton>
        </ListItem>
        <Divider />
      </>
    );
    
    // Renders Exit Dashboard functionality
    exitButton = (
      <>
        <ListItem style={{ marginTop: "0.5em", marginBottom: "0.5em" }}>
          <ListItemButton
            style={{ display: "flex", flexDirection: "column" }}
            onClick={navigateReturn}
          >
            <ListItemIcon
              style={{
                alignSelf: "center",
                justifyContent: "center",
                alignItems: "center",
                color: selectedTheme.colors.headertext,
              }}
            >
              <LogoutIcon sx={{ fontSize: "1.3em" }} />
            </ListItemIcon>{" "}
            <h4
              style={{
                textAlign: "center",
                color: selectedTheme.colors.headertext,
                fontSize: "0.7em",
              }}
            >
              Exit Dashboard
            </h4>
          </ListItemButton>
        </ListItem>
      </>
    );
  }

  // Returns current chosen theme
  function getTheme() {
    const ct = JSON.parse(localStorage.getItem("currentTheme"));

    if (ct === null) {
      return "Blue";
    } else {
      if (ct.name === "green") {
        return "Green";
      }
      if (ct.name === "blue") {
        return "Blue";
      }
      if (ct.name === "dark") {
        return "Dark Mode";
      }
      if (ct.name === "highcon") {
        return "High Contrast";
      }
      if (ct.name === "") {
        return "Green";
      }
    }
  }

  const [openSettings, setOpenSettings] = React.useState(false); //holds visiblity state of settings popup
  let currentTheme = getTheme();
  console.log(currentTheme);
  const [value, setValue] = React.useState(currentTheme); //holds current value of chosen theme by user

  const handleClickListItem = () => {
    setOpenSettings(true);
  };

  // handles closing of settings and sets newly chosen theme
  const handleClose = (newValue) => {
    console.log(newValue);
    setOpenSettings(false);

    if (newValue === "Green") {
      setValue(newValue);
      setSelectedTheme(green);
      localStorage.setItem("currentTheme", JSON.stringify(green));
    }
    if (newValue === "Blue") {
      setValue(newValue);
      localStorage.setItem("currentTheme", JSON.stringify(blue));
      setSelectedTheme(blue);
    }
    if (newValue === "Dark Mode") {
      setValue(newValue);
      localStorage.setItem("currentTheme", JSON.stringify(dark));
      setSelectedTheme(dark);
    }
    if (newValue === "High Contrast") {
      setValue(newValue);
      localStorage.setItem("currentTheme", JSON.stringify(highcon));
      setSelectedTheme(highcon);
    }
  };

  const [showPdf, setShowPdf] = useState(false); //hold visiblity state of help popup

  const handleHelpButton = () => {
    setShowPdf(!showPdf);
  };

  // Renders Header and Sidebar
  return (
    <div>
      <ToolbarThemed
        position="static"
        style={{
          height: "4vh",
          padding: "0.5em",
          boxShadow: "none",
          zIndex: 1,
        }}
      >
        <IconButton
          color="inherit"
          aria-label="menu"
          sx={{ mr: 8, ml: 4 }}
          onClick={toggleBar}
        >
          <MenuIcon style={{ fontSize: "1.3em" }} />
        </IconButton>
        <Typography variant="h2" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        {/* {badgeComponent} */}

        {/* Update with clinic value once added to the database - dummy value for the meantime */}
        <h2 className={"HeaderFont"}>{institutionName}</h2>
      </ToolbarThemed>

      <SidebarThemed
        variant="persistent"
        anchor="left"
        open={open}
        onClose={toggleBar}
        ModalProps={{
          keepMounted: true,
        }}
        PaperProps={{
          sx: {
            paddingTop: "2.5em",
            width: "9vw",
            zIndex: 0,
            boxShadow: "3",
          },
        }}
      >
        <List style={{ zIndex: 1 }}>
          <ListItem style={{ marginTop: "0.5em", marginBottom: "0.5em" }}>
            <ListItemButton
              style={{ display: "flex", flexDirection: "column" }}
              onClick={handleClickListItem}
            >
              <ListItemIcon
                style={{
                  alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  color: selectedTheme.colors.headertext,
                }}
              >
                <SettingsIcon sx={{ fontSize: "1.3em" }} />{" "}
              </ListItemIcon>{" "}
              <h4
                style={{
                  textAlign: "center",
                  color: selectedTheme.colors.headertext,
                  fontSize: "0.7em",
                }}
              >
                Settings
              </h4>
            </ListItemButton>
          </ListItem>
          <ConfirmationDialogRaw
            keepMounted
            open={openSettings}
            onClose={handleClose}
            value={value}
          />
          <Divider />
          <ListItem style={{ marginTop: "0.5em", marginBottom: "0.5em" }}>
            <ListItemButton
              style={{ display: "flex", flexDirection: "column" }}
              onClick={handleAlertButton}
            >
              <ListItemIcon
                style={{
                  alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  color: selectedTheme.colors.headertext,
                }}
              >
                <FeedbackIcon sx={{ fontSize: "1.3em" }} />
              </ListItemIcon>{" "}
              <h4
                style={{
                  textAlign: "center",
                  color: selectedTheme.colors.headertext,
                  fontSize: "0.7em",
                }}
              >
                Alerts
              </h4>
            </ListItemButton>
          </ListItem>
          <AlertBox open={showAlertPopup} onClose={handleAlertButton} />
          <Divider />
          {exportButton}
          <ListItem style={{ marginTop: "0.5em", marginBottom: "0.5em" }}>
            <ListItemButton
              style={{ display: "flex", flexDirection: "column" }}
              onClick={handleHelpButton}
            >
              <ListItemIcon
                style={{
                  alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  color: selectedTheme.colors.headertext,
                }}
              >
                <HelpIcon sx={{ fontSize: "1.3em" }} />
              </ListItemIcon>{" "}
              <h4
                style={{
                  textAlign: "center",
                  color: selectedTheme.colors.headertext,
                  fontSize: "0.7em",
                }}
              >
                Help
              </h4>
            </ListItemButton>
          </ListItem>
          <HelpGuide open={showPdf} onClose={handleHelpButton} />
          <Divider />
          {/* {exitButton} */}
          <ListItem style={{ marginTop: "0.5em", marginBottom: "0.5em" }}>
            <ListItemButton
              style={{ display: "flex", flexDirection: "column" }}
              onClick={handleLogout}
            >
              <ListItemIcon
                style={{
                  alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  color: selectedTheme.colors.headertext,
                }}
              >
                <LogoutIcon sx={{ fontSize: "1.3em" }} />
              </ListItemIcon>{" "}
              <h4
                style={{
                  textAlign: "center",
                  color: selectedTheme.colors.headertext,
                  fontSize: "0.7em",
                }}
              >
                Logout
              </h4>
            </ListItemButton>
          </ListItem>
        </List>
      </SidebarThemed>
    </div>
  );
}
