import { Card, Icon } from "@mui/material";
import React from "react";
import "./GoalStatCard.css";
import styled from "styled-components";
import { StatCard } from "../styles/DashboardComponents.styled";
import ChangingProgressProvider from "./ChangingProgressProvider";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

const HeartRateBar = ({ minAvg, maxAvg }) => {
  const data = {
    labels: ["Max HR Avg", "Min HR Avg"],
    datasets: [
      {
        label: "Heart Rate (bpm)",
        data: [maxAvg, minAvg],
        backgroundColor: ["#0F65FA", "#FF0F00"],
        borderRadius: 10,
        barThickness: 15,
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: "y",
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: Math.max(maxAvg, minAvg) + 10,
        title: {
          display: true,
          text: "BPM",
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  // Ajusta el tamaño del contenedor para que la gráfica no se salga
  return (
    <div style={{
      width: "100%",
      maxWidth: "275px",
      height: "108px",
      margin: "0 auto",
      padding: 0,
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <Bar data={data} options={options} />
    </div>
  );
}

  // convert percentage into a color from red to green
  export function getColor(percentage) {
    // with % over 100 instead show gold colour:
    if (percentage > 100) {
      return ["rgb(0, 255, 26)"].join("");
    }
    //value from 0 to 1
    var hue = ((percentage / 100) * 120).toString(10);
    return ["hsl(", hue, ",100%,50%)"].join("");
  }

  // Wheel UI
  const Wheel = ({ percentage, icon }) => {
    const WheelIcon = icon;
    return (
      <div className="wheel">
        <div
          style={{
            position: "relative",
            width: "80%",
            height: "30%",
            flex: "display",
            alignContent: "center",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="row">
            <WheelIcon
              style={{
                alignItems: "center",
                position: "absolute",
                width: "100%",
                height: "100%",
                right: "0px",
                bottom: "70%",
              }}
            />

            <p
              style={{
                position: "absolute",
                width: "100%",
                right: "0px",
                bottom: "-40%",
                fontSize: "1em",
                fontWeight: "bold",
              }}
            >
              {Math.round(percentage)}%
            </p>
          </div>
        </div>
        <div style={{ position: "absolute", width: "120px" }}>
          <ChangingProgressProvider values={[0, percentage]}>
            {(percentage) => (
              <CircularProgressbar
                value={percentage}
                strokeWidth={6}
                styles={buildStyles({
                  pathColor: getColor(percentage), //`rgba(62, 152, 199, 100)`,
                  trailColor: "#d6d6d6",
                  backgroundColor: "#3e98c7",
                  pathTransitionDuration: 0.7,
                  textColor: "black",
                  textSize: "10px",
                  strokeLinecap: "round",
                })}
              />
            )}
          </ChangingProgressProvider>
        </div>
      </div>
    );
  };


  // For glucose due to non react element in UI
  const GlucoseLayout = ({ icon }) => {
    const BloodIcon = icon;
    return (
      <div
        className="wheel"
        style={{
          display: "flex", // Enable flexbox
          flexDirection: "column", // Stack items vertically
          alignItems: "center", // Center items horizontally
          justifyContent: "center", // Center items vertically
          width: "100%",
          height: "100%", // Ensure it fills its parent
        }}
      >
        <BloodIcon
          style={{
            width: "50px",
            height: "50px",
          }}
        />
      </div>
    );
  };



  function GoalStatCard({ goalData, goals, type, hr, maxHeartRate, minHeartRate }) {
    const isGlucose = goalData.variable_name === "Glucose";
    const percentage = isGlucose ? null : (goalData.current / goalData.goal) * 100;
    if (hr) {
      console.log("mixHeartRate", minHeartRate);
      var minHrWeekly = minHeartRate.reduce((sum, item) => { return sum + item }, 0);
      var maxHrWeekly = maxHeartRate.reduce((sum, item) => sum + item, 0);
      var averageWeekly = (maxHrWeekly - minHrWeekly) / 7;
      var percentageHr = goalData.current / averageWeekly * 100;
    }
    return (
      <StatCard>
        <div className="row">
          <div style={{ height: "60px" }}>
            <p style={{ fontSize: "0.8em" }}>{goalData.variable_name} </p>
            <p style={{ fontSize: "0.55em", color: '#A9A9A9' }}>
              {goalData.detail}
            </p>
          </div>
          {isGlucose ? (
            <>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1em", fontWeight: "bold", marginTop: "0.7em" }}>
                  <GlucoseLayout icon={goalData.icon} />
                  {goalData.current} mmol/L
                </div>
              </div>
              <p style={{ fontSize: "0.6em", marginTop: "1.5em" }}>
                {`Healthy Range: ${goalData.goal}  to 10.0 mmol/L`}
              </p>
            </>
          ) : hr !== null ? (
            <div style={{ height: "135px", width: "100%", marginTop: "0.5em" }}>
              <HeartRateBar minAvg={minHrWeekly / 7} maxAvg={maxHrWeekly / 7} />
              <p style={{ fontSize: "0.6em", marginTop: "1.5em" }}>
                {`${goalData.current} / ${averageWeekly.toFixed(2)}`}
              </p>
            </div>
          ) : (
            <>
              <Wheel percentage={percentage} icon={goalData.icon} />
              <p style={{ fontSize: "0.6em", marginTop: "1.5em" }}>
                {`${goalData.current} / ${goalData.goal}`}
              </p>
            </>
          )}

        </div>
      </StatCard>
    );
  }

  export default GoalStatCard;
