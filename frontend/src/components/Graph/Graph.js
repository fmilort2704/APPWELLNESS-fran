import React, { useEffect, useRef, useState, useMemo } from "react";
import Chart from "chart.js/auto";
import { toDate } from "date-fns";
import _, { set, toLength } from "lodash";
import Axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "chartjs-adapter-date-fns";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import "./Graph.css";

let chart;

function Graph({
  filterMode,
  scale,
  theme,
  userID,
  goals,
  prediction,
  publicData,
  diabetesData,
  startDateHeader,
  setStartDateHeader,
  endDateHeader,
  setEndDateHeader,
  setDateStart,
  setDateEnd,
}) {
  let backAvailable = false;
  const [prevData, setPrevData] = useState([]);
  const [prevOpt, setPrevOpt] = useState([]);

  const [startDate, setStartDate] = useState(
    useMemo(() => new Date(new Date().setDate(new Date().getDate() - 6)), [])
  ); //set specific start and end dates for example?
  const [endDate, setEndDate] = useState(useMemo(() => new Date(), []));
  const [startDateUnpushed, setStartDateUnpushed] = useState(
    useMemo(() => new Date(new Date().setDate(new Date().getDate() - 6)), [])
  );
  const [endDateUnpushed, setEndDateUnpushed] = useState(
    useMemo(() => new Date(), [])
  );

  const [dataValues, setDataValues] = useState({
    input_data_1: [],
    input_data_2: [],
    tgt: [],
    isStacked: false,
    mode: "",
    // Add more values as needed
  });

  // const [input_data_1, setData_1] = useState([]);
  // const [input_data_2, setData_2] = useState([]);

  const [display_data_1, setDD_1] = useState([]);
  const [display_data_2, setDD_2] = useState([]);

  const [color_arr_1, setCA_1] = useState([]);
  const [color_arr_2, setCA_2] = useState([]);

  // const [tgt, setTgt] = useState([]);
  // const [isStacked, setStacked] = useState(false);
  // const [isPrediction, setIsPrediction] = useState(false);
  const [isHourly, setIsHourly] = useState(false);
  const [chartScale, setScale] = useState(scale);

  const [barColour, setBC] = useState("#779CA0");
  const [barColour2, setBC2] = useState("#556e70");
  const [targetLineColour, setTLC] = useState();
  const [cumulativeBarColour, setCMC] = useState();
  const [textColour, setTC] = useState();
  const [axisColour, setAC] = useState();

  // const customLegendRef = useRef(null);
  const chartRef = useRef(null);

  //When first loaded and whenever startdate, enddate or filtermode are changed, data is updated and concatenated with new predictions array
  useEffect(() => {
    console.log("new api call");
    // using a test public dataset id to demonstrate the hourly prediction feature with public data
    const params = {
      id: userID,
      s_date: startDate,
      e_date: endDate,
    };

    const apiUrl =
      process.env.NODE_ENV === "production"
        ? `/api/daily_data`
        : `http://localhost:5001/api/daily_data`;

    Axios.get(apiUrl, { params })
      .then((response) => {
        
        console.log('Received response, filter mode: ' + filterMode + ' data values mode: ' + dataValues.mode);
        if (filterMode === "Steps" && dataValues.mode !== "Steps") {
          setDataValues({
            ...dataValues,
            input_data_1: response.data.steps,
            tgt: goals.stepsGoal,
            isStacked: false,
            mode: "Steps",
          });
        }
        if (filterMode == "Sleep" && dataValues.mode !== "Sleep") {
          // convert into hours for increased readability
          for (
            var i = 0, length = response.data.sleep.length;
            i < length;
            i++
          ) {
            response.data.sleep[i] = response.data.sleep[i] / 60;
          }

          setDataValues({
            ...dataValues,
            input_data_1: response.data.sleep,
            tgt: goals.sleepGoal,
            isStacked: false,
            mode: "Sleep",
          });
        }
        if (filterMode == "Calories" && dataValues.mode !== "Calories") {
          setDataValues({
            ...dataValues,
            input_data_1: response.data.calories,
            tgt: goals.caloriesGoal,
            isStacked: false,
            mode: "Calories",
          });
        }
        if (filterMode == "Heart Rate" && dataValues.mode !== "Heart Rate") {
          //will use mock data for now as fitbit dataset doesn't have heart rate
          setDataValues({
            ...dataValues,
            input_data_1: response.data.low_hr,
            input_data_2: response.data.high_hr,
            tgt: 0,
            isStacked: true,
            mode: "Heart Rate",
          });
        }
        if (filterMode == "Intensity" && dataValues.mode !== "Intensity") {
          setDataValues({
            ...dataValues,
            input_data_1: response.data.activeMins,
            tgt: goals.intensityGoal,
            isStacked: false,
            mode: "Intensity",
          });
        }
        if (filterMode == "Glucose" && dataValues.mode !== "Glucose") {
          console.log('Setting glucose values: ' + response.data.glucoseValues);
          // Receive from Vital API
          setDataValues({
            ...dataValues,
            input_data_1: response.data.glucoseValues,
            tgt: 5.0,
            isStacked: false,
            mode: "Glucose",
          });
          
          console.log("Updated glucose data:", response.data.glucoseValues);
        }
      })
      .catch((error) => {
        console.error("API request error:", error);
      });
  }, [
    startDate,
    endDate,
    filterMode,
    userID,
    publicData,
    diabetesData,
    goals.stepsGoal,
    goals.sleepGoal,
    goals.caloriesGoal,
    goals.intensityGoal,
    dataValues,
  ]);

  useEffect(() => {
    setScale("days");
    setIsHourly(false);
    const currentDate = new Date();
    const isSameDay =
      endDate.getDate() === currentDate.getDate() &&
      endDate.getMonth() === currentDate.getMonth() &&
      endDate.getFullYear() === currentDate.getFullYear() &&
      filterMode !== "Heart Rate";
    // if (isSameDay && prediction) {
    //   setIsPrediction(true);
    // } else {
    //   setIsPrediction(false);
    // }
    let dd_1 = [];
    let dd_2 = [];
    let ca_1 = [];
    let ca_2 = [];
    if (isSameDay && prediction) {
      dd_1 = [...dataValues.input_data_1, ...prediction];
      ca_1 = Array(dataValues.input_data_1.length + prediction.length)
        .fill(barColour)
        .map((color, index) =>
          index >= dataValues.input_data_1.length + prediction.length - 7
            ? reduceAlpha(barColour, 0.5)
            : color
        );
      dd_2 = [];
      ca_2 = [];
    } else {
      if (dataValues.isStacked == true) {
        dd_1 = [...dataValues.input_data_1];
        ca_1 = Array(dataValues.input_data_1.length).fill(barColour);
        dd_2 = [...dataValues.input_data_2];
        ca_2 = Array(dataValues.input_data_1.length).fill(barColour2);
      } else {
        dd_1 = [...dataValues.input_data_1];
        ca_1 = Array(dataValues.input_data_1.length).fill(barColour);
        dd_2 = [];
        ca_2 = [];
      }
    }
    setDD_1(dd_1);
    setDD_2(dd_2);
    setCA_1(ca_1);
    setCA_2(ca_2);
  }, [
    startDate,
    endDate,
    filterMode,
    barColour,
    barColour2,
    prediction,
    dataValues.input_data_1,
    dataValues.isStacked,
    dataValues.input_data_2,
  ]);

  //When a date is changed it is validated ensuring the dates are within a valid range
  const handleDateChange = (start, end) => {
    const currentDate = new Date();
    if (end >= start && end <= currentDate) {
      setStartDate(start);
      setEndDate(end);
    } else if (end < start) {
      alert("End date must be after or equal to the start date.");
    } else {
      alert("End date must be before or equal to current date.");
    }
  };

  useEffect(() => {
    console.log("color change to:" + theme.colors);
    if (theme.name === "green") {
      setTLC("#2C55E7");
      setBC("#779CA0");
      setBC2("#556e70");
      setCMC("#51C1A6");
      setTC("#141414");
      setAC("#D9D9D9");
    }
    if (theme.name === "blue") {
      setTLC("#D15149");
      setBC("#89ABC5");
      setBC2("#606b8a");
      setCMC("#E5964C");
      setTC("#141414");
      setAC("#D9D9D9");
    }
    if (theme.name === "dark") {
      setTLC("#B74030");//
      setBC("#FF0F00");//
      setBC2("#0F65FA");//
      setCMC("#ffffff");
      setTC("#ffffff");//
      setAC("#ffffff");//
    }
    if (theme.name === "highcon") {
      setTLC("#B74030");
      setBC("#FF0F00");
      setBC2("#0F65FA");
      setCMC("#000000");
      setTC("#000000");
      setAC("#000000");
    }
  }, [theme]);

  let label1;
  let label2;
  if (filterMode == "Heart Rate") {
    label1 = "Lowest HR";
    label2 = "Highest HR";
  } else {
    label1 = filterMode;
    label2 = "";
  }

  useEffect(() => {
    function generateLegend() {
      const chartBox = document.querySelector(".chartBox");

      const existingLegend = document.getElementById("customLegend");
      if (existingLegend) {
        chartBox.removeChild(existingLegend);
      }
      const div = document.createElement("DIV");
      div.setAttribute("id", "customLegend");

      const ul = document.createElement("UL");

      const li = document.createElement("LI");
      const spanBox = document.createElement("SPAN");
      spanBox.style.backgroundColor = barColour;
      spanBox.style.height = "18px";
      spanBox.style.width = "18px";

      const p = document.createElement("P");
      const textNode = document.createTextNode(label1);

      p.style.fontSize = "0.9em";

      ul.appendChild(li);
      li.appendChild(spanBox);
      li.appendChild(p);
      p.appendChild(textNode);

      if (!dataValues.isStacked) {
        const li = document.createElement("LI");
        const spanBox = document.createElement("SPAN");
        spanBox.style.backgroundColor = targetLineColour;
        spanBox.style.height = "18px";
        spanBox.style.width = "18px";

        const p = document.createElement("P");
        const textNode = document.createTextNode("Target");

        p.style.fontSize = "0.9em";

        ul.appendChild(li);
        li.appendChild(spanBox);
        li.appendChild(p);
        p.appendChild(textNode);
      }

      if (isHourly) {
        const li = document.createElement("LI");
        const spanBox = document.createElement("SPAN");
        spanBox.style.backgroundColor = cumulativeBarColour;
        spanBox.style.height = "18px";
        spanBox.style.width = "18px";

        const p = document.createElement("P");
        const textNode = document.createTextNode("Cumulative");

        p.style.fontSize = "0.9em";

        ul.appendChild(li);
        li.appendChild(spanBox);
        li.appendChild(p);
        p.appendChild(textNode);
      }

      if (dataValues.isStacked) {
        const li = document.createElement("LI");
        const spanBox = document.createElement("SPAN");
        spanBox.style.backgroundColor = barColour2;
        spanBox.style.height = "18px";
        spanBox.style.width = "18px";

        const p = document.createElement("P");
        const textNode = document.createTextNode(label2);

        p.style.fontSize = "0.9em";

        ul.appendChild(li);
        li.appendChild(spanBox);
        li.appendChild(p);
        p.appendChild(textNode);
      }
      if (prediction) {
        const li = document.createElement("LI");
        const spanBox = document.createElement("SPAN");
        spanBox.style.backgroundColor = reduceAlpha(barColour, 0.5);
        spanBox.style.height = "18px";
        spanBox.style.width = "18px";

        const p = document.createElement("P");
        const textNode = document.createTextNode("Prediction");

        p.style.fontSize = "0.9em";

        ul.appendChild(li);
        li.appendChild(spanBox);
        li.appendChild(p);
        p.appendChild(textNode);
      }

      chartBox.appendChild(div);
      div.appendChild(ul);
    }
    generateLegend();
  }, [
    startDate,
    endDate,
    filterMode,
    barColour,
    barColour2,
    label1,
    isHourly,
    prediction,
    targetLineColour,
    cumulativeBarColour,
    label2,
    dataValues.isStacked,
  ]);

  const chartCanvas = document.getElementById("graph");

  useEffect(() => {
    const chartCanvas = document.getElementById("graph");
  
    if (!chartCanvas) {
      console.warn("Chart canvas is not available.");
      return; // Salir si el canvas no está disponible
    }
  
    let newEnd = new Date(endDate);
    if (prediction) {
      newEnd.setDate(newEnd.getDate() + 7);
    }
    const dateArray = [];
  
    let currentDate = new Date(startDate);
    while (currentDate.setHours(0, 0, 0, 0) <= newEnd.setHours(0, 0, 0, 0)) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    const data = {
      labels: dateArray.map((date) => toDate(date)),
      datasets: [
        label1 === "Glucose"
          ? {
              label: label1,
              type: "line",
              data: dataValues.input_data_1,
              borderColor: "red",
              borderWidth: 2,
              tension: 0.4,
            }
          : {
              label: label1,
              data: display_data_1,
              backgroundColor: color_arr_1,
              borderWidth: 2,
              borderRadius: 10,
            },
        {
          label: label2,
          data: display_data_2,
          borderWidth: 2,
          borderRadius: 10,
          backgroundColor: color_arr_2,
          hidden: !dataValues.isStacked,
        },
        {
          label: "Target",
          data: Array(display_data_1.length + 1).fill(dataValues.tgt),
          type: "line",
          borderColor: targetLineColour,
          backgroundColor: targetLineColour,
          borderWidth: 5,
          pointStyle: "none",
          pointRadius: 0,
          hidden: dataValues.isStacked,
        },
        {
          label: "Cumulative",
          type: "line",
          borderColor: cumulativeBarColour,
          backgroundColor: cumulativeBarColour,
          borderWidth: 5,
          hidden: isHourly,
        },
      ],
    };
  
    const config = {
      type: "bar",
      data: data,
      options: {
        plugins: {
          legend: {
            position: "right",
            labels: {
              font: {
                size: 17, // Increase the font size for the legend
              },
            },
            display: false,
          },
        },
        scales: {
          x: {
            stacked: dataValues.isStacked,
            title: {
              display: true,
              text: "Date",
              color: textColour,
              font: {
                size: 25,
              },
            },
            ticks: {
              color: textColour,
            },
            type: "time",
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Date",
            },
            time: {
              unit: "day",
              displayFormats: {
                day: "yyyy-MM-dd",
              },
            },
            grid: {
              color: axisColour,
              borderColor: axisColour,
            },
            offset: true,
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: filterMode,
              color: textColour,
              font: {
                size: 25,
              },
            },
            ticks: {
              color: textColour,
            },
            grid: {
              color: axisColour,
              borderColor: axisColour,
            },
          },
        },
      },
    };
  
    if (chartRef.current) {
      chartRef.current.destroy();
      chart = new Chart(chartCanvas, config);
      chartRef.current = chart;
    } else {
      chart = new Chart(chartCanvas, config);
      chartRef.current = chart;
    }
  }, [
    theme,
    startDate,
    endDate,
    display_data_1,
    display_data_2,
    color_arr_1,
    color_arr_2,
    barColour,
    barColour2,
    textColour,
    targetLineColour,
    cumulativeBarColour,
    axisColour,
    label1,
    label2,
    isHourly,
    filterMode,
    chartScale,
    prediction,
    dataValues.isStacked,
    dataValues.tgt,
  ]);

  const handleButtonClick = () => {
    chart.data = _.cloneDeep(prevData);
    chart.options = _.cloneDeep(prevOpt);
    setScale("days");
    setIsHourly(false);
    chart.update();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <label style={{ fontSize: "0.8em" }}>Start Date: </label>
          <DatePicker
            selected={startDateUnpushed}
            onChange={(date) => {setStartDateUnpushed(date); setStartDateHeader(date); setDateStart(date)}}
            dateFormat="dd/MM/yyyy"
          />
        </div>

        <div>
          <label style={{ fontSize: "0.8em" }}>End Date: </label>
          <DatePicker
            selected={endDateUnpushed}
            onChange={(date) => {setEndDateUnpushed(date); setEndDateHeader(date); setDateEnd(date)}}
            dateFormat="dd/MM/yyyy"
          />
        </div>
        <button
          onClick={() => handleDateChange(startDateUnpushed, endDateUnpushed)}
          width="50"
          height="15"
          style={{
            marginTop: "0.5em",
            backgroundColor: "whitesmoke",
            fontWeight: "bold",
            borderColor: "black",
            borderWidth: 2,
            borderRadius: 3,
            padding: "0.5em",
          }}
        >
          Update Chart
        </button>
      </div>
      <div style={{ display: "flex" }}>
        <div className="chartBox" style={{ width: "90%" }}>
          <canvas id="graph" width="440px" height="240px"></canvas>
        </div>
      </div>
      <button
        onClick={handleButtonClick}
        style={{
          display: isHourly ? "block" : "none",
          width: "50px",
          height: "20px",
        }}
      >
        Back
      </button>
    </div>
  );
}

function reduceAlpha(hexColor, alphaReduction) {
  // Convert hex to RGB
  const bigint = parseInt(hexColor.substring(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  // Ensure alphaReduction is between 0 and 1
  const newAlpha = Math.min(Math.max(alphaReduction, 0), 1);

  // Create a new RGBA color string
  const rgbaColor = `rgba(${r}, ${g}, ${b}, ${newAlpha})`;

  return rgbaColor;
}

export default Graph;