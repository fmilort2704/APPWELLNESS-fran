import { useLocation, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import GoalCard from "../../components/GoalStatCard/GoalStatCard";
import React, { useState, useEffect } from "react";
import { Header } from "../../components/Header/Header";
import RecommendationsCard, {
  recommendations,
} from "../../components/RecStatCard/RecStatCard";
import Graph from "../../components/Graph/Graph";
import {
  CardRowThemed,
  GraphCard,
  Sidebar2,
  StatCard,
  BreakdownCardHolder,
} from "../../components/styles/DashboardComponents.styled";
import { DashboardTheme } from "../../components/styles/DashboardComponents.styled";
import OverviewStatCard from "../../components/OverviewStatCard/OverviewStatCard";
import DatePicker from "react-datepicker";
import Grid from "@mui/material/Grid";
import { GlobalStyles } from "../../components/styles/Global";
import { Global } from "@emotion/react";
import { ThemeProvider } from "styled-components";
import {
  StatsBox,
  Footer,
  FormControlThemed,
  FormInputThemed,
} from "../../components/styles/DashboardComponents.styled";
import {
  highcon,
  dark,
  blue,
  green,
} from "../../components/styles/Theme.styled";
import { Container } from "../../components/styles/DashboardComponents.styled";
import Badge from "react-bootstrap/Badge";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import BedtimeIcon from "@mui/icons-material/Bedtime";
import Bloodtype from "@mui/icons-material/Bloodtype";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { IconButton } from "@mui/material";
import HeartRateIcon from "@mui/icons-material/Favorite";
import ShieldIcon from "@mui/icons-material/Shield";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import {
  forecastModel,
  forecastPublicModel,
} from "../../utility/apiCommunicator";
import ReactLoading from "react-loading";
import { BadgePopup } from "../../components/PatientBadge/BagdePopup";
import BadgeIcon from "../../components/PatientBadge/BadgeIcon";
import Papa from 'papaparse';

/**
 * 
 * @param filterMode Type of data to filter by
 * @param setFilterMode Sets type of data to filter by
 * @param userID ID of patient 
 * @param selectedTheme currently selected theme
 * @param setSelectedTheme sets currently selected theme
 * @param goals Patient goals
 * @param userData Patient data
 * @param prevWeek Previous week 
 * @returns Main body of dashboard
 */
function DashboardBody({
  filterMode,
  setFilterMode,
  userID,
  selectedTheme,
  setSelectedTheme,
  goals,
  userData,
  prevWeek,
}) {
  //const handleTypeChange
  const [publicData, setPublicData] = useState(false);
  const [diabetesData, setDiabetesData] = useState(false);
  const [isMainActive, setIsMainActive] = useState(true);
  // Handler to update state when ToggleSwitch changes
  const handleToggleSwitch = (value) => {
    console.log(value);
    setIsMainActive(value);
  };

  const [group, setGroup] = useState(
    <div style={{ margin: "auto" }}>
      {" "}
      <ReactLoading type={"bubbles"} color={"unset"} />{" "}
    </div>
  );
  var hasGroup = false;

  const [predictions, setPredictions] = useState({});

  let graphGoals = {
    stepsGoal: goals.stepsGoal.goal / 7,
    caloriesGoal: goals.caloriesGoal.goal / 7,
    sleepGoal: goals.sleepGoal.goal, // (already daily)
    intensityGoal: goals.intensityGoal.goal / 7,
  };

  var hasPrediction = false;
  // For toggle, diabetes
  //let isMainActive = true;

  async function getPrediction(userID, category) {
    let res = {};
    await forecastModel(userID, category).then((r) => {
      res = r;
    });
    return res;
  }

  useEffect(() => {
    if (!hasPrediction) {
      hasPrediction = true;

      const stepPreds = getPrediction(userID, "Steps");
      const sleepPreds = getPrediction(userID, "Sleep");
      const caloriePreds = getPrediction(userID, "Calories");
      const intensityPreds = getPrediction(userID, "Intensity");

      let categories = ["Steps", "Sleep", "Calories", "Intensity", "Glucose"];
      // run in parrallel for increased performance
      Promise.all([stepPreds, sleepPreds, caloriePreds, intensityPreds]).then(
        (responses) => {
          let tempPredictions = {};
          let i = 0;
          for (let r of responses) {
            tempPredictions[categories[i]] = r;
            i += 1;
          }
          setPredictions(tempPredictions);
        }
      );
    }
  }, []);

  //Toggles between public and client data
  function ToggleButtons() {
    const handleClick = (event, publicDataVal) => {
      if (publicDataVal !== null) {
        console.log(!publicData);
        setPublicData(!publicData);
      }
    };

    return (
      <ToggleButtonGroup
        value={publicData ? "PublicData" : ""}
        exclusive
        type="checkbox"
        onChange={handleClick}
        style={{
          fontSize: "0.8em",
          transform: "scale(1)",
          // marginTop: "5px",
          justifyContent: "space-between",
        }}
      >
        <ToggleButton value="PublicData"> Heart Rate</ToggleButton>
      </ToggleButtonGroup>
    );
  }


  /*function ImportDataModal({ onClose, onSubmit }) {
    const [error, setError] = useState(null);
    const [csvData, setCsvData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [answers, setAnswers] = useState({});
    const [mark, setMark] = useState(5);

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file && file.type === 'text/csv') {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            Papa.parse(event.target.result, {
              complete: (result) => {
                setHeaders(result.meta.fields);
                setCsvData(result.data);
                const initialAnswers = {};
                result.data.forEach((row, index) => {
                  initialAnswers[index] = '';
                });
                setAnswers(initialAnswers);
                ;
              },
              header: true,
              skipEmptyLines: true,
            });
          } catch (err) {
            setError('Error al parsear el CSV');
          }
        };
        reader.onerror = () => {
          setError('Error al leer el archivo');
        };
        reader.readAsText(file);
      } else {
        setError("El archivo no es un CSV");
      }
    };

    const handleAnswerChange = (index, value) => {
      setAnswers((prev) => ({ ...prev, [index]: value }));
      setMark(value)
    };

    const handleFormSubmit = (e) => {
      e.preventDefault();
      onSubmit(answers);
    };
    function getBetween(str, startChar, endChar) {
      const startIndex = str.indexOf(startChar);
      const endIndex = str.indexOf(endChar);

      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        return str.substring(startIndex + 1, endIndex);
      }
      return '';
    }

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '80%',
            maxWidth: '600px',
            overflowY: 'auto',
            maxHeight: '80vh',
          }}
        >
          <h3 style={{ color: 'black' }}>Import data</h3>
          <input
            style={{ width: "100%" }}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {csvData.length > 0 && (
            <form onSubmit={handleFormSubmit}>
              {csvData.map((row, index) => {
                const questionText = row["question"];
                var question;
                var smallValue;
                var bigValue;
                const isSlider = questionText.includes("0 = ");
                if (questionText.includes("0 = ")) {
                  console.log(questionText);
                  var index = questionText.indexOf("0 = ");
                  if (index !== -1) {
                    question = questionText.substring(0, index);
                  }
                  smallValue = getBetween(questionText, "=", "10");
                  index = questionText.indexOf("10 =");
                  if (index !== -1) {
                    bigValue = questionText.substring(index + 4);
                  }
                  console.log("Palabra = " + questionText + " + " + questionText.charAt(questionText.length - 1))
                } else {
                  question = questionText;
                }


                return (
                  <div key={index} style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'black' }}>
                      {question}
                    </label>
                    {isSlider ? (<>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={answers[index] || 0}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                      />
                      <div style={{ color: "black", flexWrap: "wrap", display: "flex", width: "100%", gap: "4rem" }}>
                        <span style={{ width: "40%" }}>{smallValue}</span>
                        <span style={{ width: "40%" }}>{bigValue}</span>
                      </div>
                    </>
                    ) : (
                      <select
                        value={answers[index] || ''}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="opcion1">Opción 1</option>
                        <option value="opcion2">Opción 2</option>
                        <option value="opcion3">Opción 3</option>
                        <option value="opcion4">Opción 4</option>
                      </select>
                    )}
                  </div>
                );
              })}
              <div style={{ marginTop: '10px', textAlign: 'left' }}>
                <button type="submit" style={{ marginRight: "0.5rem" }}>
                  Send
                </button>
                <button type="button" onClick={onClose}>
                  Close
                </button>
              </div>
            </form>
          )}
          {csvData.length == 0 && (
            <button style={{ marginTop: "1rem", display: "flex", left: "0" }} type="button" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  function Patients({ onClose, }) {
    const [idPatiente, setIdPatient] = useState("");
    const [patientData, setPatientData] = useState([]);
    const [dataAlert, setDataAlert] = useState(false);
    const [idClinician, setIdClinician] = useState("");
    const [idUser, setIdUser] = useState("");
    const [patients, setPatients] = useState([]);
    const [patientSelected, setPatientSelected] = useState([]);
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    const getPatients = async () => {
      setIdClinician(localStorage.getItem("clinicianId"));
      console.log(idClinician)
      if (!idClinician) {
        alert("Please, introduce a valid clinician id");
        return;
      }
      setLoading(true);
      setPatients([]);

      try {
        const response = await fetch(`http://localhost:5001/api/clinicians/${idClinician}/up_users`);
        if (!response.ok) {
          throw new Error('Error getting the users');
        }
        const data = await response.json();
        setPatients(data);
        setShow(true);
      } catch (e) {
        console.error(e);
        alert("Is not posible load the patients")
      } finally {
        setLoading(false);
      }
    };

    const dataPatientSelected = (e) => {
      const id = e.target.value;
      const patient = patients.find((p) => p.id.toString() === id);
      setPatientSelected(patient);
    }

    const data = () => {
      setDataAlert(true)
    }

    const close = () => {
      setDataAlert(false)
    }

    const handleFormSubmit = (e) => {
      e.preventDefault();
      setIdUser(e.target.value)
    };


    useEffect(() => {
      setIdPatient(10);
      if (patientSelected) {
        fetch(`http://localhost:5001/api/up_users/${idPatiente}`)
          .then(response => response.json())
          .then(data => setPatientData(data))
          .catch(error => console.error("Error fetching patient data"));
      }
    }, [patientSelected])

    const DataPatients = ({ data }) => {
      return (
        <div className="patient-table">
          <h2>Patient Data</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Sleep Value</th>
                <th>Sleep Target</th>
                <th>Steps</th>
                <th>Calories Value</th>
                <th>Calories Target</th>
                <th>Intensity</th>
                <th>Min Heart Rate</th>
                <th>Max Heart Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.map((data, index) => (
                <tr key={index}>
                  <td>{data.id}</td>
                  <td>{data.username}</td>
                  <td>{data.sleep_value}</td>
                  <td>{data.sleep_target}</td>
                  <td>{data.steps}</td>
                  <td>{data.calories_value}</td>
                  <td>{data.calories_target}</td>
                  <td>{data.intensity}</td>
                  <td>{data.min_heart_rate}</td>
                  <td>{data.max_heart_rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}
      >
        <div style={{
          width: "100%",
          color: "black",
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: '80%',
          maxWidth: '600px',
          overflowY: 'auto',
          maxHeight: '80vh',
        }}>
          <h2 className="text-xl font-bold mb-4">Select a patient</h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            onClick={getPatients}
            disabled={loading}
          >
            {loading ? 'Searching...' : "Show patients"}
          </button>

          {patients.length > 0 && (
            <>
              <form onSubmit={handleFormSubmit}>
                <select
                  className="border px-3 py-2 rounded w-full mb-4"
                  onChange={dataPatientSelected}
                  defaultValue=""
                >
                  <option value="" disabled>
                    -- Choose a patient --
                  </option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.username}
                    </option>
                  ))}
                </select>
                {dataAlert && (
                  <DataPatients data={patientData} />
                )}

                <div>
                  <button type="button" onClick={data}>
                    Show data
                  </button>
                  <button type="button" onClick={onClose}>
                    Close
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    )
  }*/


  function ToggleSwitch({ isMainActive, isGlucoseActive, isSurveysActive, onToggle }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [importDataAlert, setImportDataAlert] = useState(false);
    const [patientsAlert, setPatientsAlert] = useState(false)

    const handleClick = (index) => {
      onToggle(!isMainActive);
      setActiveIndex(index)
    };

    const exportData = () => {
      setImportDataAlert(true);
    };

    const dataPatient = () => {
      setPatientsAlert(true)
    }



    const handleModalClose = () => {
      //setImportDataAlert(false);
      setPatientsAlert(false)
    };

    const handleModalSubmit = (data) => {
      console.log('Imported data:', data);
    };

    return (
      <>
        <div
          className="toggle-container"
          onClick={handleClick}
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '300px',
            height: '30px',
            borderRadius: '15px',
            backgroundColor: '#000',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          <div
            className="toggle"
            style={{
              position: 'absolute',
              top: '2px',
              width: '48.5%',
              height: '27px',
              borderRadius: '18px',
              backgroundColor: 'white',
              transform: isMainActive ? 'translateX(0)' : 'translateX(100px)',
              transition: 'transform 0.3s ease',
            }}
          ></div>
          <div
            className="toggle-label"
            style={{
              zIndex: 1,
              width: '33%',
              textAlign: 'center',
              lineHeight: '40px',
              color: isMainActive ? 'black' : 'white',
            }}
          >
            Home
          </div>
          <div
            className="toggle-label"
            style={{
              zIndex: 1,
              width: '50%',
              textAlign: 'center',
              lineHeight: '40px',
              color: !isMainActive ? 'black' : 'white',
            }}
          >
            Glucose
          </div>
          <div
            className="toggle-label"
            style={{
              zIndex: 1,
              width: '50%',
              textAlign: 'center',
              lineHeight: '40px',
              color: !isMainActive ? 'black' : 'white',
            }}
          >
            data
          </div>
        </div>


        {/* <div
          className="toggle-container"
          onClick={dataPatient}
          style={{
            marginLeft: '1rem',
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '150px',
            height: '30px',
            borderRadius: '15px',
            backgroundColor: '#000',
            cursor: 'pointer',
            overflow: 'hidden',
            lineHeight: '40px',
            fontSize: '1.25rem',
          }}
        >
          Show patients
        </div>
        {importDataAlert && (
          <ImportDataModal onClose={handleModalClose} onSubmit={handleModalSubmit} />
        )}
        {patientsAlert && (
          <Patients onClose={handleModalClose} />
        )} */}
      </>
    );
  }
  /*const [surveys, setSurveys] = useState([]);
  
  useEffect(() => {
    const fetchSurveys = async () => {
      const response = await fetch("http://localhost:1337/admin/content-manager/collection-types/api::survey.survey/7");
      const data = await response.json();
      setSurveys(data);
    };
    fetchSurveys();
  }, []);
  
  console.log(surveys)*/

  // Handles changing of theme
  useEffect(() => {
    const currentTheme = JSON.parse(localStorage.getItem("currentTheme"));
    if (currentTheme) {
      setSelectedTheme(currentTheme);
    }
  }, [setSelectedTheme]);

  const stepsValue =
    Math.round(userData.steps) || "NaN, No current week's data";

  // Renders main dashboard body
  return (
    <ThemeProvider theme={selectedTheme}>
      <GlobalStyles />
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div className="Dashboard-Body">
          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                height: "45px",
                alignItems: "center",
              }}
            >
              <h1
                style={{
                  fontSize: "0.8em",
                  height: "40px",
                  lineHeight: "40px",
                  margin: 0,
                  // marginTop: "5px",
                }}
              >
                Weekly Overview
              </h1>
              <div style={{
                display: "flex",
                flexDirection: "row",
                gap: "20px",
                alignItems: "center",
              }}>
                {
                  isMainActive ? (
                    <ToggleButtons />
                  ) : (
                    <>
                    </>
                  )
                }

                <div style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "45px",
                }}>
                  <ToggleSwitch
                    isMainActive={isMainActive}
                    onToggle={handleToggleSwitch}
                  />
                </div>
              </div>

            </div>

            <div>
              {isMainActive ? (
                // The "Main" Content
                <>
                  <CardRowThemed>
                    <OverviewStatCard
                      title="Steps"
                      value={stepsValue}
                      noCurrentData={!userData.steps}
                      change={prodPercentageString(prevWeek.steps, userData.steps)}
                      goal={goals.stepsGoal}
                      explanation={
                        "Total weekly steps for the current week. Change % calculated using last weeks value."
                      }
                    ></OverviewStatCard>
                    <OverviewStatCard
                      title="Sleep (hours)"
                      value={userData.sleep.toFixed(1)}
                      change={prodPercentageString(prevWeek.sleep, userData.sleep)}
                      goal={goals.sleepGoal}
                      explanation={
                        "Average daily sleep hours for the current week. Change % calculated using last weeks value."
                      }
                    ></OverviewStatCard>
                    <OverviewStatCard
                      title="Intensity Minutes"
                      value={Math.round(userData.intensity) || "NaN"}
                      change={prodPercentageString(
                        prevWeek.intensity,
                        userData.intensity
                      )}
                      explanation={
                        "Total intensity minutes for the current week. Change % calculated using last weeks value."
                      }
                    ></OverviewStatCard>
                    <OverviewStatCard
                      title="Heart Rate (bpm)"
                      value1={Math.round(userData.minHeartRate)}
                      value2={Math.round(userData.maxHeartRate)}
                      change1={prodPercentageString(
                        prevWeek.minHeartRate,
                        userData.minHeartRate
                      )}
                      change2={prodPercentageString(
                        prevWeek.maxHeartRate,
                        userData.maxHeartRate
                      )}
                      explanation={
                        "Average daily min and max heart rate over the week. Change % calculated using last weeks values."
                      }
                      goal={goals.intensityGoal}
                    ></OverviewStatCard>
                    <GoalCard goalData={goals.stepsGoal} />
                    <GoalCard goalData={goals.sleepGoal} />

                    <GoalCard
                      goalData={diabetesData ? goals.glucoseValue : goals.intensityGoal}
                      goals={goals}
                      type={"last"}
                    />
                    <GoalCard
                      goalData={publicData ? goals.heartRate : goals.caloriesGoal}
                      goals={goals}
                      type={"last"}
                    />
                  </CardRowThemed>
                </>
              ) : (
                // Nothing to show here for Diabetes
                <>
                </>
              )}
            </div>


          </div>
          <div>
            <div
              style={{
                marginTop: "-0.2em",
                textAlign: "left",
                fontSize: "0.8em",
                alignItems: "center",
                display: "flex",
                fontFamily: "Raleway, sans-serif",
              }}
            >
              {
                isMainActive ? (
                  <FormControlThemed
                    sx={{
                      marginBottom: "0.2em",
                      width: "9vw",
                      height: "1.6em",
                      marginRight: "0.5em",
                    }}
                    variant="standard"
                  >
                    <Select
                      value={filterMode}
                      onChange={(e) => setFilterMode(e.target.value)}
                      input={
                        <FormInputThemed
                          style={{
                            fontSize: "0.8em",

                            alignSelf: "center",
                            color: selectedTheme.colors.headertext,
                          }}
                        />
                      }
                    >
                      {" "}
                      <MenuItem value="Steps"></MenuItem>
                      <MenuItem selected="selected" value={"Steps"}>
                        Steps
                      </MenuItem>
                      <MenuItem value={"Sleep"}>Sleep</MenuItem>
                      <MenuItem value={"Calories"}>Calories</MenuItem>
                      <MenuItem value={"Heart Rate"}>Heart Rate</MenuItem>
                      <MenuItem value={"Intensity"}>Intensity</MenuItem>
                    </Select>


                  </FormControlThemed>
                ) : (
                  // No select element for diabetes graph
                  <>
                  </>
                )}
              {/* Breakdown */}
            </div>

            {
              isMainActive ? (

                <BreakdownCardHolder>
                  <div className={"Breakdown"}>
                    <GraphCard>
                      <Graph
                        filterMode={filterMode} //make this change
                        scale="days"
                        theme={selectedTheme}
                        userID={userID}
                        goals={graphGoals}
                        prediction={predictions[filterMode]}
                        publicData={publicData}
                      />
                    </GraphCard>
                    <div
                      style={{
                        position: "relative",
                        overflow: "auto",
                        width: "30%",
                      }}
                    >
                      <StatsBox>
                        {/*<GoalCard goalData={getGoal(filterMode)} />*/}
                        {/*<KeyStatsCard name={filterMode} />*/}
                        <RecommendationsCard
                          recommendation={recommendations.heartRateTargetZones}
                          maxHeartRateMonthAv={userData.avMaxHr}
                          predictions={predictions}
                          selectedTheme={selectedTheme}
                        />
                        <RecommendationsCard
                          recommendation={recommendations.stepsRecommendation}
                          goalData={goals.stepsGoal}
                          predictions={predictions}
                          selectedTheme={selectedTheme}
                        />
                        <RecommendationsCard
                          recommendation={recommendations.intensitryRecommendation}
                          goalData={goals.intensityGoal}
                          predictions={predictions}
                          selectedTheme={selectedTheme}
                        />
                        <RecommendationsCard
                          recommendation={recommendations.sleepRecommendation}
                          goalData={goals.sleepGoal}
                          predictions={predictions}
                          selectedTheme={selectedTheme}
                        />
                        <RecommendationsCard
                          recommendation={recommendations.caloriesRecommendation}
                          goalData={goals.caloriesGoal}
                          predictions={predictions}
                          selectedTheme={selectedTheme}
                        />
                      </StatsBox>
                    </div>
                  </div>
                </BreakdownCardHolder>
              ) : (
                <BreakdownCardHolder>
                  <div className={"Breakdown"}>
                    <GraphCard>
                      <Graph
                        filterMode="Glucose" // Just glucose for diabetes section
                        scale="days"
                        theme={selectedTheme}
                        userID={userID}
                        goals={graphGoals}
                        prediction={predictions[filterMode]}
                        publicData={publicData}
                      />
                    </GraphCard>
                    <div
                      style={{
                        position: "relative",
                        overflow: "auto",
                        width: "30%",
                      }}
                    >
                      <StatsBox>
                        <GoalCard
                          goalData={goals.glucoseValue}
                          goals={goals}
                          type={"last"}
                        />
                        {/* <RecommendationsCard
                      recommendation={recommendations.caloriesRecommendation}
                      goalData={goals.caloriesGoal}
                      predictions={predictions}
                      selectedTheme={selectedTheme}
                    /> */}
                      </StatsBox>
                    </div>
                  </div>
                </BreakdownCardHolder>
              )
            }
          </div>
        </div>
        <div style={{ width: "12.5vw", paddingTop: "3vh" }}>
          <BadgeIcon
            theme={selectedTheme}
            name={userData.name}
            userID={userID}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}



export const Dashboard = () => {
  const location = useLocation();
  const [selectedTheme, setSelectedTheme] = useState(blue);
  const [userData, setUserData] = useState({
    name: "",
    steps: 0,
    stepsTarget: 0,
    sleep: 0,
    sleepTarget: 0,
    calories: 0,
    calorieTarget: 0,
    intensity: 0,
    intensityTarget: 150, // (from World Health Org)
    minHeartRate: 0,
    maxHeartRate: 0,
    avModHighIntensityHr: 89,
    avModHighIntensityHrTarget: 101,
    avMaxHr: 0,
    glucoseValue: 0,
  });
  const [prevWeek, setPrevWeek] = useState({
    name: "",
    steps: 0,
    stepsTarget: 0,
    sleep: 0,
    sleepTarget: 0,
    calories: 0,
    calorieTarget: 0,
    intensity: 0,
    intensityTarget: 150, // (from World Health Org)
    minHeartRate: 0,
    maxHeartRate: 0,
    avModHighIntensityHr: 89,
    avModHighIntensityHrTarget: 101,
    avMaxHr: 0,
    glucoseValue: 0
  });
  const [goals, setGoals] = useState({
    sleepGoal: {
      current: 0,
      goal: 0,
      variable_name: "Sleep",
      icon: BedtimeIcon,
    },
    caloriesGoal: {
      current: 0,
      goal: 0,
      variable_name: "Calories",
      icon: LocalFireDepartmentIcon,
    },
    stepsGoal: {
      current: 0,
      goal: 0,
      variable_name: "Steps",
      icon: DirectionsWalkIcon,
    },
    intensityGoal: {
      current: 0,
      goal: 0,
      variable_name: "Intensity",
      icon: ElectricBoltIcon,
    },
    glucose: {
      current: 0,
      goal: 0,
      variable_name: "Glucose"
    },
    // (public data feature: weekly av hr at moderate and high intensity)
    // glucose: {
    //   current: 0,
    //   goal: 0,
    //   variable_name: "Glucose"
    // },
    heartRate: {
      current: userData.avModHighIntensityHr,
      goal: userData.avModHighIntensityHrTarget,
      variable_name: "Heart Rate",
      icon: HeartRateIcon,
      detail: "Average moderate-high intensity heart rate",
    },
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      let params = {
        id: location.state.id,
        s_date: new Date(new Date().setDate(new Date().getDate() - 6)),
        e_date: new Date(),
      };

      const preUrl =
        process.env.NODE_ENV === "production" ? "" : "http://localhost:5001";

      const [response, response2, avMaxHrResponse] = await Promise.all([
        Axios.get(preUrl + "/api/daily_data", { params }),
        Axios.get(preUrl + "/api/targets", { params }),
        Axios.get(preUrl + "/api/ht_month_av", { params }),
      ]);

      setUserData((prevUserData) => ({
        ...prevUserData,
        name: response.data.name,
        steps: response.data.steps.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0
        ),
        stepsTarget: prevUserData.stepsTarget,
        sleep: calculateAverageWithoutZeros(response.data.sleep) / 60,
        sleepTarget: prevUserData.sleepTarget,
        calories: response.data.calories.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0
        ),
        calorieTarget: prevUserData.calorieTarget,
        intensity: response.data.activeMins.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0
        ),
        intensityTarget: 150, // (from World Health Org)
        minHeartRate: calculateAverageWithoutZeros(response.data.low_hr),
        maxHeartRate: calculateAverageWithoutZeros(response.data.high_hr),
        avModHighIntensityHr: 89,
        avModHighIntensityHrTarget: 101,
        avMaxHr: avMaxHrResponse.data.average,
        glucoseValue: response.data.glucoseValues[response.data.glucoseValues.length - 1]
      }));

      setUserData((prevUserData) => ({
        ...prevUserData,
        stepsTarget: response2.data.step_tgt * 7,
        sleepTarget: response2.data.sleep_tgt / 60,
        calorieTarget: response2.data.cal_tgt * 7,
      }));

      params = {
        id: location.state.id,
        s_date: new Date(new Date().setDate(new Date().getDate() - 13)),
        e_date: new Date(new Date().setDate(new Date().getDate() - 7)),
      };

      const apiUrl =
        process.env.NODE_ENV === "production"
          ? `/api/daily_data`
          : `http://localhost:5001/api/daily_data`;

      const response3 = await Axios.get(apiUrl, { params });

      setPrevWeek((prevPrevWeek) => ({
        ...prevPrevWeek,
        name: response3.data.name,
        steps: response3.data.steps.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0
        ),
        sleep: calculateAverageWithoutZeros(response3.data.sleep) / 60,
        calories: response3.data.calories.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0
        ),
        intensity: response3.data.activeMins.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0
        ),
        intensityTarget: 150, // (from World Health Org)
        minHeartRate: calculateAverageWithoutZeros(response3.data.low_hr),
        maxHeartRate: calculateAverageWithoutZeros(response3.data.high_hr),
        avModHighIntensityHr: 89,
        avModHighIntensityHrTarget: 101,
        glucoseValue: calculateAverageWithoutZeros(response3.data.glucoseValues)
      }));

      setLoading(false);
    } catch (error) {
      console.error("API request error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDataWrapper = async () => {
      await fetchData();
      const currentTheme = JSON.parse(localStorage.getItem("currentTheme"));

      if (currentTheme) {
        setSelectedTheme(currentTheme);
      }
    };

    fetchDataWrapper();
  }, []);

  useEffect(() => {
    setGoals((prevGoals) => ({
      ...prevGoals,
      sleepGoal: {
        current: userData.sleep.toFixed(1),
        goal: userData.sleepTarget,
        variable_name: "Sleep Goal",
        icon: BedtimeIcon,
        detail: "Av. daily sleep (hours)",
      },
      caloriesGoal: {
        current: userData.calories,
        goal: userData.calorieTarget,
        variable_name: "Calories Goal",
        icon: LocalFireDepartmentIcon,
        detail: "Total weekly calories goal",
      },
      stepsGoal: {
        current: userData.steps,
        goal: userData.stepsTarget,
        variable_name: "Steps Goal",
        icon: DirectionsWalkIcon,
        detail: "Total weekly steps goal",
      },
      intensityGoal: {
        current: userData.intensity,
        goal: userData.intensityTarget,
        variable_name: "Intensity Goal",
        icon: ElectricBoltIcon,
        detail: "Total moderate-high intensity minutes",
      },
      // (public data feature: weekly av hr at moderate and high intensity)
      heartRate: {
        current: userData.avModHighIntensityHr,
        goal: userData.avModHighIntensityHrTarget,
        variable_name: "Heart Rate Goal",
        icon: HeartRateIcon,
        detail: "Av. moderate-high intensity heart rate",
      },
      // example glucose live data - last reading from user
      glucoseValue: {
        current: userData.glucoseValue,
        goal: 3.9,
        variable_name: "Glucose",
        icon: Bloodtype,
        detail: "Last glucose reading (mmol/L)",
      },
    }));
  }, [userData, prevWeek]);

  const navigate = useNavigate();

  const navigateReturn = (name) => {
    navigate("/", {});
  };

  const [filterMode, setFilterMode] = useState("Steps");

  if (loading) {
    // Render a loading spinner or message while data is being fetched
    return <p>Loading...</p>;
  } else {
    console.log("LOADED");
  }

  // Renders full dashboard screen
  return (
    <ThemeProvider theme={selectedTheme}>
      <GlobalStyles />
      <div className={"Dashboard"}>
        <Header
          name={userData.name}
          userID={location.state.id}
          navigateReturn={navigateReturn}
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
        />
        <DashboardBody
          filterMode={filterMode}
          setFilterMode={setFilterMode}
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
          userID={location.state.id}
          userData={userData}
          goals={goals}
          prevWeek={prevWeek}
        />
        <Footer style={{ zIndex: 1 }} />
      </div>
    </ThemeProvider>
  );
};

function prodPercentageString(prevWeek, thisWeek) {
  try {
    const percentageChange = ((thisWeek - prevWeek) / prevWeek) * 100;
    return percentageChange >= 0
      ? `+${percentageChange.toFixed(0)}%`
      : `${percentageChange.toFixed(0)}%`;
  } catch {
    return "--%";
  }
}

function calculateAverageWithoutZeros(list) {
  console.log("list:");
  console.log(list);
  const filteredList = list.filter((element) => element !== 0);

  if (filteredList.length === 0) {
    return 0; // Return 0 if all elements are 0
  }

  const sum = filteredList.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
  const average = sum / filteredList.length;

  return average.toFixed(2);
}
