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
import SurveyGraph from "../../components/Graph/surveyGraph";
import PatientList from "../../components/Graph/PatientList";
import BadgeData from "../../components/PatientBadge/BadgeData";
import { da } from "date-fns/locale";

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
  setFilterType,
  setFilteredQuestions,
  setSelectedQuestion,
  setSelectedQuestionId,
  selectedQuestionId,
  dateStart,
  setDateStart,
  dateEnd,
  setDateEnd,
  setActiveIndex
}) {
  //const handleTypeChange
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 6)));
  const [endDate, setEndDate] = useState(new Date());
  const [publicData, setPublicData] = useState(false);
  const [diabetesData, setDiabetesData] = useState(false);
  const [isMainActive, setIsMainActive] = useState(true);
  const [isGlucoseActive, setIsGucoseActive] = useState(false);
  const [isSurveyActive, setIsSurveyActive] = useState(false);

  console.log("startDate", startDate);
  console.log("endDate", endDate);

  const handleFilterTypeChange = (newFilterType) => {
    //console.log("Filter type changed to:", newFilterType);
    setFilterType(newFilterType);
  };

  const handleFilteredQuestionsChange = (questions) => {
    //console.log("Filtered questions:", questions);
    setFilteredQuestions(questions);
  };

  const handleSelectedQuestionChange = (question) => {
    //console.log("Selected question:", question);
    setSelectedQuestion(question);
  };

  const handleSelectedQuestionChangeId = (id) => {
    console.log("Selected question:", id);
    setSelectedQuestionId(id);
  };

  const handleStartDateChange = (date) => {
    setDateStart(date);
  }

  const handleEndDateChange = (date) => {
    setDateEnd(date);
  }

  const activeIndex = isMainActive ? 0 : isGlucoseActive ? 1 : 2;

  // Handler to update state when ToggleSwitch changes
  const handleToggleSwitch = (mainActive, glucoseActive, surveyActive) => {
    setIsMainActive(mainActive);
    setIsGucoseActive(glucoseActive);
    setIsSurveyActive(surveyActive);
  };

  useEffect(() => {
    setActiveIndex(activeIndex);
  }, [activeIndex, setActiveIndex]);

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

  function ToggleSwitch({ isMainActive, isGlucoseActive, isSurveysActive, onToggle, activeIndex: initialActiveIndex }) {
    const [activeIndex, setActiveIndex] = useState(initialActiveIndex);

    useEffect(() => {
      setActiveIndex(initialActiveIndex);
    }, [initialActiveIndex]);

    const handleClick = (index) => {
      setActiveIndex(index);
      if (index === 0) {
        console.log("Main active");
        onToggle(true, false, false);
      } else if (index === 1) {
        console.log("Glucose active");
        onToggle(false, true, false);
      } else if (index === 2) {
        console.log("Surveys active");
        onToggle(false, false, true);
      }
    };

    return (
      <div
        className="toggle-container"
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
            width: '33%',
            height: '27px',
            borderRadius: '18px',
            backgroundColor: 'white',
            transform: `translateX(${activeIndex * 100}px)`,
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
            color: activeIndex === 0 ? 'black' : 'white',
          }}
          onClick={() => handleClick(0)}
        >
          Home
        </div>
        <div
          className="toggle-label"
          style={{
            zIndex: 1,
            width: '33%',
            textAlign: 'center',
            lineHeight: '40px',
            color: activeIndex === 1 ? 'black' : 'white',
          }}
          onClick={() => handleClick(1)}
        >
          Glucose
        </div>
        <div
          className="toggle-label"
          style={{
            zIndex: 1,
            width: '33%',
            textAlign: 'center',
            lineHeight: '40px',
            color: activeIndex === 2 ? 'black' : 'white',
          }}
          onClick={() => handleClick(2)}
        >
          Surveys
        </div>
      </div>
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
                    isGlucoseActive={isGlucoseActive}
                    isSurveysActive={isSurveyActive}
                    onToggle={handleToggleSwitch}
                    activeIndex={isMainActive ? 0 : isGlucoseActive ? 1 : 2} // Define activeIndex aquí
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
                    <GoalCard goalData={goals.stepsGoal} hr={null} />
                    <GoalCard goalData={goals.sleepGoal} hr={null} />

                    <GoalCard
                      goalData={diabetesData ? goals.glucoseValue : goals.intensityGoal}
                      goals={goals}
                      type={"last"}
                      hr={null}
                    />
                    <GoalCard
                      goalData={publicData ? goals.heartRate : goals.caloriesGoal}
                      goals={goals}
                      type={"last"}
                      hr={publicData ? true : null}
                      maxHeartRate={userData.dataMaxReartRate}
                      minHeartRate={userData.dataMinReartRate}
                    />{console.log("Public data" + userData.dataMaxReartRate)}
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
                    style={{ backgroundColor: selectedTheme.colors.cardHolders }}
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
                            color: selectedTheme.colors.statcardtitles,
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


            {isMainActive ? (
              <BreakdownCardHolder>
                <div className={"Breakdown"}>
                  <GraphCard>
                    <Graph
                      filterMode={filterMode} // Main content filter
                      scale="days"
                      theme={selectedTheme}
                      userID={userID}
                      goals={graphGoals}
                      prediction={predictions[filterMode]}
                      publicData={publicData}
                      startDateHeader={startDate}
                      setStartDateHeader={setStartDate}
                      endDateHeader={endDate}
                      setEndDateHeader={setEndDate}
                      setDateStart={handleStartDateChange}
                      setDateEnd={handleEndDateChange}
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
            ) : isGlucoseActive ? (
              <BreakdownCardHolder>
                <div className={"Breakdown"}>
                  <GraphCard>
                    <Graph
                      filterMode="Glucose" // Glucose-specific filter
                      scale="days"
                      theme={selectedTheme}
                      userID={userID}
                      goals={graphGoals}
                      prediction={predictions[filterMode]}
                      publicData={publicData}
                      startDateHeader={startDate}
                      setStartDateHeader={setStartDate}
                      endDateHeader={endDate}
                      setEndDateHeader={setEndDate}
                      setDateStart={handleStartDateChange}
                      setDateEnd={handleEndDateChange}
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
                    </StatsBox>
                  </div>
                </div>
              </BreakdownCardHolder>
            ) : isSurveyActive ? (
              <BreakdownCardHolder>
                <div className={"Breakdown"}>
                  <GraphCard>
                    <SurveyGraph
                      patientId={10}
                      theme={selectedTheme}
                      setFilterType={handleFilterTypeChange}
                      setFilteredQuestions={handleFilteredQuestionsChange}
                      setSelectedQuestion={handleSelectedQuestionChange}
                      setSelectedQuestionId={handleSelectedQuestionChangeId}
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
                      <PatientList
                        clinicianId={localStorage.getItem("clinicianId")}
                        selectedQuestionId={selectedQuestionId}
                        selectedPatient={localStorage.getItem("patientId")}
                      />
                    </StatsBox>
                  </div>
                </div>
              </BreakdownCardHolder>
            ) : null}
          </div>
        </div>
        <div style={{ width: "14.5vw", paddingTop: "3vh" }}>
          {/*<BadgeIcon
            theme={selectedTheme}
            name={userData.name}
            userID={userID}
          />*/}
          <BadgeData
            name={localStorage.getItem("patientName")}
            theme={selectedTheme}
            email={localStorage.getItem("email")}
            group={group}
            userId={localStorage.getItem("patientId")}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}



export const Dashboard = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 6)));
  const [endDate, setEndDate] = useState(new Date());
  const [filterType, setFilterType] = useState("all");
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const location = useLocation();
  const userType = location.state?.userType;
  const [selectedTheme, setSelectedTheme] = useState(dark);
  const [userData, setUserData] = useState({
    name: "",
    steps: 0,
    stepsTarget: 0,
    sleep: 0,
    sleepTarget: 0,
    calories: 0,
    calorieTarget: 0,
    intensity: 0,
    intensityTarget: 150,
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

  const changeActiveIndex = (value) => {
    setActiveIndex(value);
    console.log(value);
  };

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

      console.log(response.data)



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
        glucoseValue: response.data.glucoseValues[response.data.glucoseValues.length - 1],
        dataMaxReartRate: response.data.high_hr,
        dataMinReartRate: response.data.low_hr
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
        console.log("Current theme:", currentTheme);
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
          activeIndex={activeIndex}
          filterType={filterType}
          filteredQuestions={filteredQuestions}
          selectedQuestion={selectedQuestion}
          selectedQuestionId={selectedQuestionId}
          filterMode={filterMode}
          startDate={startDate}
          endDate={endDate}
          userType={userType}
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
          setFilterType={setFilterType}
          setFilteredQuestions={setFilteredQuestions}
          setSelectedQuestion={setSelectedQuestion}
          setSelectedQuestionId={setSelectedQuestionId}
          selectedQuestionId={selectedQuestionId}
          dateStart={startDate}
          dateEnd={endDate}
          setDateStart={setStartDate}
          setDateEnd={setEndDate}
          setActiveIndex={changeActiveIndex}
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
