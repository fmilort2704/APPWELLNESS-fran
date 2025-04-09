import { Card, CardActionArea, CardContent, Grid } from "@mui/material";
import ReactCardFlip from "react-card-flip";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { OverviewCard, StatCard } from "../styles/DashboardComponents.styled";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { capitalize } from "lodash";
import ReactLoading from "react-loading";

// default recommendations with values that get updated with pulled db data values
export const recommendations = {
  heartRateTargetZones: {
    title: "Target Heart Rate Zones",
    explanationText:
      "Heart rate target intensity zones calculated using % of average maximum heart rate using the users' most recent (up to 30 days) of available data.",
  },
  stepsRecommendation: {
    title: "Steps Recommendation",
    predictedNextWeeklyValue: 0,
    goal: 0,
    attributeName: "total steps",
    filterName: "Steps",
    units: "",
    explanationText:
      "The steps recommendation is calculated by comparing next week steps predictions and the steps goal.",
  },
  caloriesRecommendation: {
    title: "Calories Recommendation",
    predictedNextWeeklyValue: 0,
    goal: 0,
    attributeName: "total calories",
    filterName: "Calories",
    units: "",
    explanationText:
      "The calories recommendation is calculated by comparing next week calories predictions and the calories goal.",
  },
  sleepRecommendation: {
    title: "Sleep Recommendation",
    predictedNextWeeklyValue: 0, // (550 / 60).toFixed(2),
    goal: 0,
    attributeName: "daily sleep",
    filterName: "Sleep",
    units: "hours",
    explanationText:
      "The sleep recommendation is calculated by comparing next week sleep predictions and the sleep goal.",
  },
  intensitryRecommendation: {
    title: "Intensity Recommendation",
    predictedNextWeeklyValue: 0,
    goal: 0,
    attributeName: "total intensity",
    filterName: "Intensity",
    units: "mins",
    explanationText:
      "The total intensity minutes recommendation is calculated by comparing next week total intensity predictions and the intensity goal.",
  },
};

// gets the content for the first recommendation card bullet point
function getBulletOne(recommendation, maxHeartRateMonthAv) {
  if (maxHeartRateMonthAv !== null) {
    return (
      "Light Activity Intensity: " +
      Math.round(maxHeartRateMonthAv * 0.6) +
      "-" +
      Math.round(maxHeartRateMonthAv * 0.7) +
      " bpm"
    );
  } else {
    return (
      "Next week predicted " +
      recommendation.attributeName +
      ": " +
      recommendation.predictedNextWeeklyValue +
      " " +
      recommendation.units
    );
  }
}

// gets the content for the second recommendation card bullet point
function getBulletTwo(recommendation, maxHeartRateMonthAv) {
  if (maxHeartRateMonthAv !== null) {
    return (
      "Moderate Activity Intensity: " +
      Math.round(maxHeartRateMonthAv * 0.7) +
      "-" +
      Math.round(maxHeartRateMonthAv * 0.8) +
      " bpm"
    );
  } else {
    return get_forecast_recommendation(recommendation);
  }
}

// uses the patient's next week forecast and goal to generate appropriate recommendations
function get_forecast_recommendation(recommendation) {
  // calculate the daily increase needed to reach goal and give recommendation on result
  let updatedUnits = recommendation.units;
  // don't divide sleep by 7 since it's measured as daily av not weekly total
  let dailyIncrease =
    recommendation.attributeName !==
    recommendations.sleepRecommendation.attributeName
      ? (recommendation.goal - recommendation.predictedNextWeeklyValue) / 7
      : (recommendation.goal - recommendation.predictedNextWeeklyValue).toFixed(
          2
        );
  if (
    recommendation.attributeName ===
      recommendations.sleepRecommendation.attributeName &&
    dailyIncrease < 1
  ) {
    // change recommendation to be in minutes if below one hour increase for increased readability
    dailyIncrease = Math.round(dailyIncrease * 60);
    updatedUnits = "mins";
  } else {
    if (
      recommendation.attributeName !==
      recommendations.sleepRecommendation.attributeName
    ) {
      dailyIncrease = Math.round(dailyIncrease);
    }
  }

  if (dailyIncrease > 0) {
    return (
      "Increase " +
      recommendation.attributeName +
      " on a daily average by " +
      dailyIncrease +
      " " +
      updatedUnits
    );
  } else {
    return "On track for weekly " + recommendation.attributeName + " goal";
  }
}

function RecStatCard({
  recommendation,
  selectedTheme,
  maxHeartRateMonthAv = null,
  goalData = null,
  predictions = null,
  loading = true,
}) {
  const [cardFlip, setCardFlip] = useState(false);
  // only show recommendation card content once gathered ai prediction data
  const [recommendationsUI, setRecommendationsUI] = useState(
    <div style={{ height: "50px", marginBottom: "1em" }}>
      <p>Gathering AI predictions and recommendations</p>{" "}
      <ReactLoading
        type={"bubbles"}
        color={selectedTheme.colors.headertext}
        height={5}
      />
    </div>
  );

  useEffect(() => {
    if (
      predictions &&
      ((recommendation.title === recommendations.heartRateTargetZones.title &&
        predictions["Steps"]) ||
        predictions[recommendation.filterName])
    ) {
      setRecommendationsUI(
        <ul style={{ paddingLeft: "1em" }}>
          <li style={{}}>
            {getBulletOne(recommendation, maxHeartRateMonthAv)}
          </li>
          <li
            style={{
              listStylePosition: "outside",
            }}
          >
            {getBulletTwo(recommendation, maxHeartRateMonthAv)}
          </li>
          {recommendation.title ===
          recommendations.heartRateTargetZones.title ? (
            <li>
              {"High Activity Intensity: " +
                Math.round(maxHeartRateMonthAv * 0.8) +
                "-" +
                Math.round(maxHeartRateMonthAv * 0.9) +
                " bpm"}
            </li>
          ) : (
            <div></div>
          )}
        </ul>
      );
    }
  }, [maxHeartRateMonthAv, predictions, recommendation]);

  if (
    recommendation.title !== recommendations.heartRateTargetZones.title &&
    predictions[recommendation.filterName]
  ) {
    recommendation.goal = goalData.goal;

    let recommendation_weekly = predictions[recommendation.filterName].reduce(
      (a, b) => a + b,
      0
    );

    if (recommendation.title === recommendations.sleepRecommendation.title) {
      recommendation_weekly = (recommendation_weekly / 7).toFixed(2);
    } else {
      recommendation_weekly = Math.round(recommendation_weekly);
    }

    recommendation.predictedNextWeeklyValue = recommendation_weekly;
  }

  const handleClick = () => {
    setCardFlip(!cardFlip);
    console.log({ cardFlip });
  };

  return (
    <div>
      <ReactCardFlip
        isFlipped={cardFlip}
        flipDirection="horizontal"
        flipSpeedBackToFront="2"
        flipSpeedFrontToBack="2"
      >
        <OverviewCard
          style={{
            height: "100%",
            overflow: "hidden",
            marginLeft: "0.5em",
            marginRight: "0.5em",
          }}
        >
          <CardActionArea
            style={{
              width: "100%",
              alignContent: "start",
              display: "flex",
              justifyContent: "start",
              alignItems: "start",
              margin: "0.2em",
            }}
          >
            <CardContent
              onClick={handleClick}
              style={{
                padding: "0.2em",
              }}
            >
              <Grid container spacing={2}>
                <div
                  style={{
                    width: "100%",
                    marginLeft: "0.8em",
                    marginTop: "1em",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h2
                    style={{
                      float: "left",
                      fontSize: "1.2em",
                    }}
                  >
                    {recommendation.title}
                  </h2>
                  <InfoOutlinedIcon
                    style={{ float: "right", height: "2.5vh" }}
                  />
                </div>
                <div
                  style={{
                    marginLeft: "0.8em",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "Palanquin, sans-serif",
                      lineHeight: "1em",
                      fontSize: "1em",
                      textAlign: "start",
                      margin: "5px",
                    }}
                  >
                    {recommendationsUI}
                  </p>
                </div>
              </Grid>
            </CardContent>
          </CardActionArea>
        </OverviewCard>

        {/* Explanation card: */}
        <OverviewCard
          style={{
            height: "100%",
            overflow: "hidden",
            marginLeft: "0.5em",
            marginRight: "0.5em",
          }}
        >
          <CardActionArea
            style={{
              width: "100%",
              alignContent: "start",
              display: "flex",
              justifyContent: "start",
              alignItems: "start",
            }}
          >
            <CardContent
              onClick={handleClick}
              style={{
                padding: "0.2em",
                height: "100%",
              }}
            >
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "1em",
                      textAlign: "left",
                    }}
                  >
                    {recommendation.explanationText}
                  </p>
                </div>
                <KeyboardBackspaceIcon />
              </div>
            </CardContent>
          </CardActionArea>
        </OverviewCard>
      </ReactCardFlip>
    </div>
  );
}

export default RecStatCard;
