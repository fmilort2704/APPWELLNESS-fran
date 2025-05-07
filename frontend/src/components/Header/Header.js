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
  light,
  dark,
} from "../../components/styles/Theme.styled";
import { ThemeProvider } from "styled-components";
import { icons } from "react-icons/lib";
import { LegendToggleRounded } from "@mui/icons-material";
import { HelpGuide } from "../Sidebar/Help";
import Axios from "axios";
import { data, useLocation, useNavigate } from "react-router-dom";
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
  activeIndex,
  filterType,
  filteredQuestions,
  selectedQuestion,
  selectedQuestionId,
  filterMode,
  startDate,
  endDate,
}) {
  console.log("initial activeIndex", activeIndex);
  function formatDate(date) {
    if (!isNaN(date)) {
      let yyyy = date.getFullYear();
      let mm = String(date.getMonth() + 1).padStart(2, "0");
      let dd = String(date.getDate()).padStart(2, "0");

      return `${yyyy}-${mm}-${dd}`;
    } else {
      return null
    }
  }
  startDate = formatDate(startDate);
  endDate = formatDate(endDate);

  console.log("Header", startDate + " " + endDate);
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
    localStorage.removeItem("patientId");
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
            activeIndex !== 2
              ? activeIndex === 1
                ? process.env.NODE_ENV === "production"
                  ? `/api/all_ap_user_data`
                  : `http://localhost:5001/api/all_ap_user_data`
                : process.env.NODE_ENV === "production"
                  ? `/api/weekly_data/${localStorage.getItem("patientId")}/${startDate}/${endDate}`
                  : `http://localhost:5001/api/weekly_data/${localStorage.getItem("patientId")}/${startDate}/${endDate}`
              : process.env.NODE_ENV === "production"
                ? `/api/patients/${localStorage.getItem("patientId")}/answers_14_days`
                : `http://localhost:5001/api/patients/${localStorage.getItem("patientId")}/answers_14_days`;
          console.log("API URL:", apiUrl);
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
  }, [activeIndex, name, setSelectedTheme, startDate, endDate]);

  function DownloadJSON() {
    let dataToExport;
    if (activeIndex === 2) {
      console.log("activeIndex", activeIndex);
      if (selectedQuestion === null) {
        if (filterType !== "all") {
          dataToExport = userData.filter((user) =>
            filteredQuestions.some((fq) => fq.question === user.question)
          );
        } else {
          dataToExport = userData;
        }
      } else {
        dataToExport = userData.filter((user) => user.question === selectedQuestion);
      }
    } else if (activeIndex === 0) {
      console.log("activeIndex", activeIndex);
      switch (filterMode) {
        case "Steps":
          dataToExport = userData.map(({ user_id, id, steps, step_target, created_at, updated_at, created_by_id, updated_by_id }) => ({
            user_id, id, steps, step_target, created_at, updated_at, created_by_id, updated_by_id
          }));
          break;

        case "Sleep":
          dataToExport = userData.map(({ user_id, id, sleep_value, sleep_target, created_at, updated_at, created_by_id, updated_by_id }) => ({
            user_id, id, sleep_value, sleep_target, created_at, updated_at, created_by_id, updated_by_id
          }));
          break;

        case "Calories":
          dataToExport = userData.map(({ user_id, id, calories_value, calories_target, created_at, updated_at, created_by_id, updated_by_id }) => ({
            user_id, id, calories_value, calories_target, created_at, updated_at, created_by_id, updated_by_id
          }));
          break;

        case "Intensity":
          dataToExport = userData.map(({ user_id, id, intensity, created_at, updated_at, created_by_id, updated_by_id }) => ({
            user_id, id, intensity, created_at, updated_at, created_by_id, updated_by_id
          }));
          break;

        case "Heart Rate":
          dataToExport = userData.map(({ user_id, id, min_heart_rate, max_heart_rate, created_at, updated_at, created_by_id, updated_by_id }) => ({
            user_id, id, min_heart_rate, max_heart_rate, created_at, updated_at, created_by_id, updated_by_id
          }));
          break;

        default:
          dataToExport = userData.map(({
            user_id, id, sleep_target, sleep_value, steps, calories_target, calories_value,
            intensity, min_heart_rate, max_heart_rate, created_at, updated_at, created_by_id, updated_by_id, step_target
          }) => ({
            user_id, id, sleep_target, sleep_value, steps, calories_target, calories_value,
            intensity, min_heart_rate, max_heart_rate, created_at, updated_at, created_by_id, updated_by_id, step_target
          }));
          break;
      }
    } else {
      console.log("activeIndex", activeIndex);
      dataToExport = userData.map(({
        user_id, id, sleep_target, sleep_value, steps, calories_target, calories_value,
        intensity, min_heart_rate, max_heart_rate, created_at, updated_at, created_by_id, updated_by_id, step_target
      }) => ({
        user_id, id, sleep_target, sleep_value, steps, calories_target, calories_value,
        intensity, min_heart_rate, max_heart_rate, created_at, updated_at, created_by_id, updated_by_id, step_target
      }));
    }

    downloadFile({
      data: JSON.stringify(dataToExport),
      fileName: activeIndex === 2
        ? "survey_user_id_" + localStorage.getItem("patientId") + "'s_data.json"
        : "user_id_" + localStorage.getItem("patientId") + "'s_data.json",
      fileType: "text/json",
    });
    selectedQuestion = null;
  }

  function DownloadCSV() {
    let headers, usersCsv;

    if (activeIndex === 0) {
      console.log("activeIndex", activeIndex);
      switch (filterMode) {
        case "Steps":
          headers = ["user_id,id,steps,step_target,created_at,updated_at,created_by_id,updated_by_id"];
          usersCsv = userData.reduce((acc, user) => {
            const { user_id, id, steps, step_target, created_at, updated_at, created_by_id, updated_by_id } = user;
            acc.push([user_id, id, steps, step_target, created_at, updated_at, created_by_id, updated_by_id].join(","));
            return acc;
          }, []);
          break;

        case "Sleep":
          headers = ["user_id,id,sleep_value,sleep_target,created_at,updated_at,created_by_id,updated_by_id"];
          usersCsv = userData.reduce((acc, user) => {
            const { user_id, id, sleep_value, sleep_target, created_at, updated_at, created_by_id, updated_by_id } = user;
            acc.push([user_id, id, sleep_value, sleep_target, created_at, updated_at, created_by_id, updated_by_id].join(","));
            return acc;
          }, []);
          break;

        case "Calories":
          headers = ["user_id,id,calories_value,calories_target,created_at,updated_at,created_by_id,updated_by_id"];
          usersCsv = userData.reduce((acc, user) => {
            const { user_id, id, calories_value, calories_target, created_at, updated_at, created_by_id, updated_by_id } = user;
            acc.push([user_id, id, calories_value, calories_target, created_at, updated_at, created_by_id, updated_by_id].join(","));
            return acc;
          }, []);
          break;

        case "Intensity":
          headers = ["user_id,id,intensity,created_at,updated_at,created_by_id,updated_by_id"];
          usersCsv = userData.reduce((acc, user) => {
            const { user_id, id, intensity, created_at, updated_at, created_by_id, updated_by_id } = user;
            acc.push([user_id, id, intensity, created_at, updated_at, created_by_id, updated_by_id].join(","));
            return acc;
          }, []);
          break;

        case "Heart Rate":
          headers = ["user_id,id,min_heart_rate,max_heart_rate,created_at,updated_at,created_by_id,updated_by_id"];
          usersCsv = userData.reduce((acc, user) => {
            const { user_id, id, min_heart_rate, max_heart_rate, created_at, updated_at, created_by_id, updated_by_id } = user;
            acc.push([user_id, id, min_heart_rate, max_heart_rate, created_at, updated_at, created_by_id, updated_by_id].join(","));
            return acc;
          }, []);
          break;

        default:
          headers = ["user_id,id,sleep_target,sleep_value,steps,calories_target,calories_value,intensity,min_heart_rate,max_heart_rate,created_at,updated_at,created_by_id,updated_by_id,step_target"];
          usersCsv = userData.reduce((acc, user) => {
            const {
              user_id,
              id,
              sleep_target,
              sleep_value,
              steps,
              calories_target,
              calories_value,
              intensity,
              min_heart_rate,
              max_heart_rate,
              created_at,
              updated_at,
              created_by_id,
              updated_by_id,
              step_target,
            } = user;
            acc.push(
              [
                user_id,
                id,
                sleep_target,
                sleep_value,
                steps,
                calories_target,
                calories_value,
                intensity,
                min_heart_rate,
                max_heart_rate,
                created_at,
                updated_at,
                created_by_id,
                updated_by_id,
                step_target,
              ].join(",")
            );
            return acc;
          }, []);
          break;
      }
    } else if(activeIndex === 2) {
      console.log("activeIndex", activeIndex);
      headers = ["user_id,id,question,answer"];
      if (selectedQuestion === null) {
        if (filterType === "all") {
          usersCsv = userData.reduce((acc, user) => {
            const { user_id, id, question, answer } = user;
            acc.push([user_id, id, question, answer].join(","));
            return acc;
          }, []);
        } else {
          usersCsv = filteredQuestions.reduce((acc, user) => {
            const { user_id, id, question, answer } = user;
            acc.push([user_id, id, question, answer].join(","));
            return acc;
          }, []);
        }
      } else {
        console.log("User data", userData.filter((user) => user.question === selectedQuestion));
        usersCsv = userData.filter((user) => user.question === selectedQuestion).reduce((acc, user) => {
          const { user_id, id, question, answer } = user;
          acc.push([user_id, id, question, answer].join(","));
          return acc;
        }, []);
      }
    } else {
      console.log("activeIndex", activeIndex);  
      headers = ["user_id,id,sleep_target,sleep_value,steps,calories_target,calories_value,intensity,min_heart_rate,max_heart_rate,created_at,updated_at,created_by_id,updated_by_id,step_target"];
          usersCsv = userData.reduce((acc, user) => {
            const {
              user_id,
              id,
              sleep_target,
              sleep_value,
              steps,
              calories_target,
              calories_value,
              intensity,
              min_heart_rate,
              max_heart_rate,
              created_at,
              updated_at,
              created_by_id,
              updated_by_id,
              step_target,
            } = user;
            acc.push(
              [
                user_id,
                id,
                sleep_target,
                sleep_value,
                steps,
                calories_target,
                calories_value,
                intensity,
                min_heart_rate,
                max_heart_rate,
                created_at,
                updated_at,
                created_by_id,
                updated_by_id,
                step_target,
              ].join(",")
            );
            return acc;
          }, []);
    }
    downloadFile({
      data: [...headers, ...usersCsv].join("\n"),
      fileName:
        activeIndex === 2
          ? `survey_user_id_${localStorage.getItem("patientId")}_answers.csv`
          : `user_id_${localStorage.getItem("patientId")}_data.csv`,
      fileType: "text/csv",
    });
    selectedQuestion = null;
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
  const [value, setValue] = React.useState(currentTheme); //holds current value of chosen theme by user

  const handleClickListItem = () => {
    setOpenSettings(true);
  };

  // handles closing of settings and sets newly chosen theme
  const handleClose = (newValue) => {
    setOpenSettings(false);
    if (newValue === "Dark Mode") {
      setValue(newValue);
      localStorage.setItem("currentTheme", JSON.stringify(dark));
      setSelectedTheme(dark);
    }
    if (newValue === "High Contrast") {
      setValue(newValue);
      localStorage.setItem("currentTheme", JSON.stringify(light));
      setSelectedTheme(light);
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
