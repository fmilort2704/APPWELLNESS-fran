import "./PatSelect.css";
import "./PatCard.css";
import "./PatTable.css";
import React, { useState, useEffect } from "react";
import { BiSolidRightArrow } from "react-icons/bi";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "../../components/Header/Header";
import {
  Footer,
  FormControlThemed,
  FormInputThemed,
  PatientTableFootThemed,
  PatientRowThemed,
  PatientCardThemed,
  PatientTableThemed,
  PatientTableHeadThemed,
  PatientTableRowThemed,
  PatientTableCellThemed,
} from "../../components/styles/PatientSelectComponents.styled";
import { GlobalStyles } from "../../components/styles/Global";
import { Global } from "@emotion/react";
import { ThemeProvider } from "styled-components";
import {
  dark,
  highcon,
} from "../../components/styles/Theme.styled";
import Axios from "axios";
import { TableBody, TableContainer, TableFooter } from "@mui/material";
import {
  FormControl,
  InputLabel,
  Input,
  MenuItem,
  Select,
} from "@mui/material";
import { Tooltip, IconButton, Modal, Box } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { Add, Search } from "@mui/icons-material";
import styled from "styled-components";
import { findAllByDisplayValue } from "@testing-library/react";

const user = {
  name: "Halima Macias",
  clinician: "Travis Cook",
  clinic: "Default Clinic",
  UID: "8490073671"
}
const user2 = {
  name: "Jannat Butler",
  clinician: "Travis Cook",
  clinic: "Default Clinic",
  UID: "8416875312"
}
const user3 = {
  name: "Dora Robbins",
  clinician: "Bernard Skinner",
  clinic: "Default Clinic",
  UID: "8215887612"
}
const user4 = {
  name: "Shawn Landry",
  clinician: "Bernard Skinner",
  clinic: "Default Clinic",
  UID: "7923648991"
}

const userList = [user, user2, user3, user4]

const AddPatientButton = styled(IconButton)`
  && {
    background-color: white !important;
    color: black !important; 
    border-radius: 50%; 
    width: 40px; 
    height: 40px; 
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1) !important;

    &:hover {
      background-color: #f0f0f0 !important; 
      color: black !important;
    }
  }
`;

/**
 * 
 * @param patients List of patients 
 * @param navigateFunction Function to navigate to chosen patients dashboard 
 * @returns Card row for patient cards
 */
function CardRow({ patients, navigateFunction, clinicianId, refreshUserList }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleAddPatientClick = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSearch = (email, setUserData) => {
    const apiUrlSearch =
      process.env.NODE_ENV === "production"
        ? `/api/search-user`
        : `http://localhost:5001/api/search-user`;

    Axios.post(apiUrlSearch, { email })
      .then((response) => {
        console.log("User found:", response.data);
        setUserData({ ...response.data, clinicianId });
      })
      .catch((error) => {
        console.error("Error:", error.response?.data || error.message);
        setUserData(null);
      });
  };

  return (
    <div className="PatientCard">
      <div
        className="PatientCardRowHeader"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: "1.2em", margin: 0 }}>Your Users</h1>
        <Tooltip title="Add patient" arrow>
          <AddPatientButton onClick={handleAddPatientClick}>
            <Add />
          </AddPatientButton>
        </Tooltip>
      </div>
      <PatientRowThemed>
        {patients.map((e, i) => (
          <PatientCard key={i} patient={e} navigateFunction={navigateFunction} />
        ))}
      </PatientRowThemed>
      <AddPatientPopup
        open={isPopupOpen}
        onClose={() => {
          handleClosePopup();
          refreshUserList();
        }}
        handleSearch={handleSearch}
        clinicianId={clinicianId}
      />
    </div>
  );
}

function AddPatientPopup({ open, onClose, handleSearch, clinicianId }) {
  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetPopupState = () => {
    setEmail(""); // Clear the email input
    setUserData(null); // Clear user data
    setError(""); // Clear any errors
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    setError("");
  };

  const onSearch = () => {
    setLoading(true);
    setError("");
    setUserData(null);

    handleSearch(email, (data) => {
      console.log(email);
      setLoading(false);
      if (data) {
        setUserData(data);
      } else {
        setError("No user found with the provided email.");
      }
    });
  };

  const onConfirm = () => {
    const apiUrlAddUser =
      process.env.NODE_ENV === "production"
        ? `/api/add-user`
        : `http://localhost:5001/api/add-user`;

    Axios.post(apiUrlAddUser, {
      clinicianId,
      userId: userData.id,
    })
      .then((response) => {
        console.log("User successfully assigned:", response.data);
        resetPopupState(); // Reset the popup state after a successful action
        onClose(); // Close the popup
      })
      .catch((error) => {
        if (error.response?.data?.message === "This user has already been added.") {
          setError("This user has already been added.");
        } else {
          console.error("Error assigning user:", error.response?.data || error.message);
        }
      });
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        resetPopupState(); // Reset the state when closing the popup
        onClose();
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          bgcolor: "black",
          color: "white",
          boxShadow: 24,
          p: 5,
          borderRadius: 3,
          fontFamily: "Raleway, sans-serif",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "1.5em",
            marginBottom: "30px",
          }}
        >
          Add User
        </h2>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "40px" }}>
          <Input
            value={email}
            onChange={handleInputChange}
            placeholder="Enter email address"
            sx={{
              flex: 1,
              color: "white",
              backgroundColor: "#333",
              padding: "12px",
              borderRadius: "5px",
              fontFamily: "Raleway, sans-serif",
            }}
            inputProps={{
              style: { color: "white" },
            }}
          />
          <IconButton
            onClick={onSearch}
            sx={{
              backgroundColor: "white",
              color: "black",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              "&:hover": {
                backgroundColor: "#ddd",
              },
            }}
          >
            <Search />
          </IconButton>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
            <CircularProgress style={{ color: "white" }} />
          </div>
        ) : error ? (
          <p
            style={{
              color: "grey",
              fontSize: "0.8em",
              textAlign: "center",
              marginTop: "20px",
              fontFamily: "Raleway, sans-serif",
            }}
          >
            {error}
          </p>
        ) : userData ? (
          <div
            style={{
              background: "#1a1a1a",
              padding: "20px",
              borderRadius: "10px",
              fontFamily: "Raleway, sans-serif",
            }}
          >
            <h3 style={{ marginBottom: "10px", fontSize: "1.2em" }}>{userData.fullName}</h3>
            <p style={{ marginBottom: "20px", fontSize: "0.9em" }}>{userData.email}</p>
            <div style={{ display: "flex", justifyContent: "end" }}>
              <button
                style={{
                  background: "white",
                  color: "black",
                  border: "none",
                  borderRadius: "30px",
                  padding: "12px 20px",
                  fontFamily: "Raleway, sans-serif",
                  fontSize: "0.8em",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "background 0.3s, color 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#e0e0e0";
                  e.target.style.color = "#333";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "white";
                  e.target.style.color = "black";
                }}
                onClick={onConfirm}
              >
                Add User
              </button>
            </div>
          </div>
        ) : (
          <p
            style={{
              color: "grey",
              fontSize: "0.8em",
              textAlign: "center",
              marginTop: "20px",
              fontFamily: "Raleway, sans-serif",
            }}
          >
            Search for a user to add them to your list.
          </p>
        )}
      </Box>
    </Modal>
  );
}

/**
 * 
 * @param patients List of patients 
 * @param navigateFunction Function to navigate to chosen patients dashboard 
 * @returns Patient Card
 */
function PatientCard({ patient, navigateFunction }) {
  localStorage.setItem("patientName", patient.name);
  /*const [items, setItems] = useState([]);

  useEffect(() => {
    const data = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      data.push({ key, value });
    }
    setItems(data);
  }, []);
  console.log(items);*/
  return (
    <PatientCardThemed
      onClick={() => navigateFunction(patient.UID, patient.name)}
    >
      <div className="PatCard">
        <div className="PatCard-Text">
          <h1>{patient.name}</h1>
          <hr></hr>
          <h2>{patient.UID}</h2>
        </div>
      </div>
      {/*<BiSolidRightArrow className={"PatCard-Icon"} size={50}/>*/}
    </PatientCardThemed>
  );
}


/**
 * 
 * @param patients List of patients 
 * @param navigateFunction Function to navigate to chosen patients dashboard 
 * @returns Searchbar and patient table
 */
function PatientTable({ patients, navigateFunction }) {
  const [filterText, setFilterText] = useState("");
  const [filterMode, setFilterMode] = useState("All");
  return (
    <div className={"PatTab"}>
      <h1 style={{ fontSize: "1.2em" }}>All Users</h1>
      <PatientSearchBar
        filterText={filterText}
        onFilterTextChange={setFilterText}
        filterMode={filterMode}
        onFilterModeChange={setFilterMode}
      />
      <div>
        <FullPatientTable
          patients={patients}
          filterText={filterText}
          filterMode={filterMode}
          navigateFunction={navigateFunction}
        />
      </div>
    </div>
  );
}


/**
 * 
 * @param patients List of patients 
 * @param navigateFunction Function to navigate to chosen patients dashboard 
 * @param filterText Text to filter by
 * @param filterMode Type of data to filter by
 * @returns Patient table
 */
function FullPatientTable({
  patients,
  filterText,
  filterMode,
  navigateFunction,
}) {
  const parsed = JSON.parse(localStorage.getItem("currentTheme"));
  const overviewBg = parsed.colors.overviewbackground;
  const overviewstat = parsed.colors.overviewstat;

  const rows = [];

  patients.forEach((patient) => {
    let patName = patient.name.toLowerCase();
    let patClin = patient.clinician.toLowerCase();
    let patUID = patient.UID;
    let fil = filterText.toLowerCase();
    let selName = ["All", "Name"].includes(filterMode);
    let selClin = ["All", "Clinician"].includes(filterMode);
    let selUID = ["All", "UID"].includes(filterMode);
    if (
      !(
        (selName && patName.indexOf(fil) !== -1) ||
        (selClin && patClin.indexOf(fil) !== -1) ||
        (selUID && (patUID === parseInt(fil) || fil === ""))
      )
    ) {
      return;
    }
    rows.push({
      name: patient.name,
      clinician: patient.clinician,
      uid: patient.UID,
    });
  });

  return (
    <TableContainer
      sx={{ minHeight: "50vh", maxHeight: "50vh", borderRadius: "0.5vw" }}
    >
      <PatientTableThemed stickyHeader>
        <PatientTableHeadThemed style={{ backgroundColor: "" }}>
          <th style={{ width: 30 + "%" }}>Name</th>
          <th style={{ width: 30 + "%" }}>Clinician</th>
          <th style={{ width: 30 + "%" }}>UID</th>
        </PatientTableHeadThemed>
        <TableBody>
          {rows.length === 0 ? (
            <PatientTableRowThemed>
              <PatientTableCellThemed
                colSpan={4}
                align="center"
                style={{ fontSize: "1em" }}
              >
                No Results
              </PatientTableCellThemed>
            </PatientTableRowThemed>
          ) : (
            rows.map((row) => (
              <PatientTableRowThemed
                hover
                onClick={() => navigateFunction(row.uid, row.name)}
                className={"PatTab-Button"}
              >
                <PatientTableCellThemed
                  align="center"
                  style={{ fontSize: "0.7em", color: overviewstat }}
                >
                  {row.name}
                </PatientTableCellThemed>
                <PatientTableCellThemed
                  align="center"
                  style={{ fontSize: "0.7em", color: overviewstat }}
                >
                  {row.clinician}
                </PatientTableCellThemed>
                <PatientTableCellThemed
                  align="center"
                  style={{ fontSize: "0.7em", color: overviewstat }}
                >
                  {row.uid}
                </PatientTableCellThemed>
              </PatientTableRowThemed>
            ))
          )}
        </TableBody>
        <PatientTableFootThemed />
      </PatientTableThemed>
    </TableContainer>
  );
}



/**
 * 
 * @param onFilterTextChange Function handling text change 
 * @param onFilterModeChange Function handling data type change  
 * @param filterText Text to filter by
 * @param filterMode Type of data to filter by
 * @returns Patient searchbar
 */
function PatientSearchBar({
  filterText,
  onFilterTextChange,
  filterMode,
  onFilterModeChange,
}) {
  const parsed = JSON.parse(localStorage.getItem("currentTheme"));
  const overviewBg = parsed.colors.overviewbackground;
  console.log(overviewBg);
  const overviewstat = parsed.colors.overviewstat;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <FormControlThemed
        sx={{
          backgroundColor: overviewBg, m: 1, height: "1.3em", width: "8vw"
        }}
        variant="standard"
      >
        <Select
          value={filterMode}
          onChange={(e) => onFilterModeChange(e.target.value)}
          input={
            <FormInputThemed style={{ fontSize: "0.5em", marginTop: "8px", color: overviewstat }} />
          }
        >
          {" "}
          <MenuItem value="All"></MenuItem>
          <MenuItem selected="selected" value={"All"}>
            All
          </MenuItem>
          <MenuItem value={"Name"}>Hola</MenuItem>
          <MenuItem value={"Clinician"}>Clinician</MenuItem>
          <MenuItem value={"UID"}>UID</MenuItem>
        </Select>
      </FormControlThemed>
      <FormControlThemed
        style={{
          backgroundColor: overviewBg,
          width: "30vw",
          paddingLeft: "0.2em",
          paddingRight: "0.2em",
          height: "1.3em",
        }}
      >
        <span style={{ backgroundColor: overviewBg }}>
          <Input
            value={filterText}
            placeholder="Search..."
            onChange={(e) => onFilterTextChange(e.target.value)}
            inputProps={{ style: { fontSize: "1.5em", color: overviewstat } }}
            sx={{
              width: "30vw",
              "&::placeholder": { fontSize: "32px" },
            }}
          />{" "}
        </span>
      </FormControlThemed>
    </div>
  );
}

/**
 * 
 * @returns Patient Select Screen
 */
export function PatSelect() {
  const [data, setData] = useState([]);
  const location = useLocation();
  const userType = location.state?.userType;
  const [institutionName, setInstitutionName] = useState("");
  const [clinicianId, setClinicianId] = useState(null);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const savedInstitution =
      location.state?.institution || localStorage.getItem("institution");
    if (savedInstitution) {
      setInstitutionName(savedInstitution);
    }

    const loggedInClinicianId = localStorage.getItem("clinicianId");
    console.log(`Clinician id from localStorage: ${loggedInClinicianId}`);
    if (loggedInClinicianId) {
      setClinicianId(parseInt(loggedInClinicianId));
    }

    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");
    if (firstName && lastName) {
      setFullName(`${firstName} ${lastName}`);
    }
  }, [location.state]);

  const refreshUserList = () => {
    if (clinicianId !== null) {
      console.log(`Refreshing user list for clinicianId: ${clinicianId}`);

      const apiUrlDetails =
        process.env.NODE_ENV === "production"
          ? `/api/clinician-user-details`
          : `http://localhost:5001/api/clinician-user-details`;

      Axios.post(apiUrlDetails, { clinicianId })
        .then((response) => {
          setData(response.data);
          console.log("Updated Response Data:", response.data);
        })
        .catch((error) => {
          console.error("Error refreshing user list:", error.response?.data || error.message);
        });
    }
  };

  useEffect(() => {
    refreshUserList();
  }, [clinicianId]);

  console.log("HERE");
  console.log(data);

  let userList = [];
  data.forEach((user) => {
    userList.push({
      name: user.user_name,
      clinician: user.clinician_name,
      clinic: user.clinic_name,
      UID: user.user_id,
    });
  });

  console.log(userList)

  const [selectedTheme, setSelectedTheme] = useState(dark);
  console.log(selectedTheme);

  useEffect(() => {
    const currentTheme = JSON.parse(localStorage.getItem("currentTheme"));
    if (currentTheme) {
      setSelectedTheme(currentTheme);
    }

  }, []);

  const navigate = useNavigate();

  const toDashboard = async (id, name) => {
    try {
      const preUrl =
        process.env.NODE_ENV === "production" ? "" : "http://localhost:5001";

      const apiUrl = `${preUrl}/api/ap_user_ids`;

      console.log(`[INFO] Fetching data for user ID: ${id}`);

      localStorage.setItem("patientId", id);

      const response = await Axios.get(apiUrl);

      console.log("[INFO] Fetched Data:", response.data);

      navigate("/dashboard", { state: { id: id, name: name } });
    } catch (error) {
      console.error("[ERROR] Failed to fetch data or navigate:", error.message);
    }
  };

  return (
    <ThemeProvider theme={selectedTheme}>
      <GlobalStyles />
      <div className="PatSelect">
        <Header
          name={fullName}
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
          institutionName={institutionName}
          userType={userType}
        />
        <div className="PatSelect-Body">
          <CardRow
            patients={userList.filter((e) => e.clinician === fullName)}
            navigateFunction={toDashboard}
            clinicianId={clinicianId}
            refreshUserList={refreshUserList} // Pass down refresh function
          />
          <hr></hr>
          <PatientTable patients={userList} navigateFunction={toDashboard} />
        </div>
        <Footer style={{ zIndex: 1 }} />
      </div>
    </ThemeProvider>
  );
}



// useEffect(() => {
//   if (clinicianId !== null) {
//     console.log(`Using Clinician id: ${clinicianId}`);

//     // const apiUrlIDs =
//     //   process.env.NODE_ENV === "production"
//     //     ? `/api/ap_user_ids`
//     //     : `http://localhost:5001/api/ap_user_ids`;

//     // Axios.get(apiUrlIDs)
//     //   .then((response) => {
//     //     setData(response.data);
//     //     console.log("Response Data:", response.data);
//     //   })
//     //   .catch((error) => {
//     //     console.error("Error:", error.response?.data || error.message);
//     //   });

//     // const apiUrlIDs =
//     //   process.env.NODE_ENV === "production"
//     //     ? `/api/clinician-user-ids`
//     //     : `http://localhost:5001/api/clinician-user-ids`;

//     // Axios.post(apiUrlIDs, { clinicianId })
//     //   .then((response) => {
//     //     setData(response.data);
//     //     console.log("Response Data:", response.data);
//     //   })
//     //   .catch((error) => {
//     //     console.error("Error:", error.response?.data || error.message);
//     //   });
//   }
// }, [clinicianId]);