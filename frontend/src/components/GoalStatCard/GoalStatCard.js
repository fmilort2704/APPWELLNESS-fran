import { Card, Icon } from "@mui/material";
import React from "react";
import "./GoalStatCard.css";
import styled from "styled-components";
import { StatCard } from "../styles/DashboardComponents.styled";
import ChangingProgressProvider from "./ChangingProgressProvider";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

// convert percentage into a color from red to green
export function getColor(percentage) {
  // with % over 100 instead show gold colour:
  if (percentage > 100) {
    return ["rgb(212,175,55)"].join("");
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



function GoalStatCard({ goalData, goals, type }) {
  const isGlucose = goalData.variable_name === "Glucose";
  const percentage = isGlucose ? null : (goalData.current / goalData.goal) * 100;

  return (
    <StatCard>
      <div className="row">
        <div style={{ height: "60px" }}>
          <p style={{ fontSize: "0.8em" }}>{goalData.variable_name} </p>
          <p style={{ fontSize: "0.55em",color:'#A9A9A9' }}>
            {goalData.detail}
          </p>
        </div>
        {isGlucose ? (
          <div style={{ textAlign: "center"}}>
            <div style={{ fontSize: "1em", fontWeight: "bold", marginTop: "0.7em" }}>
              <GlucoseLayout icon={goalData.icon} />
              {goalData.current} mmol/L
            </div>
          </div>
        ) : (
          <Wheel percentage={percentage} icon={goalData.icon} />
        )}
        <p style={{ fontSize: "0.6em", marginTop: "1.5em" }}>
          {isGlucose
            ? `Healthy Range: ${goalData.goal}  to 10.0 mmol/L`
            : `${goalData.current} / ${goalData.goal}`}
        </p>
      </div>
    </StatCard>
  );
}

export default GoalStatCard;
