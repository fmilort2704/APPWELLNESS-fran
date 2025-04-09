import React, { useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  Icon,
  cardMediaClasses,
} from "@mui/material";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import ReactCardFlip from "react-card-flip";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import Grid from "@mui/material/Grid";
import { Padding, Redeem } from "@mui/icons-material";
//import styled from "styled-components";
import { OverviewCard } from "../styles/DashboardComponents.styled";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  highcon,
  dark,
  blue,
  green,
} from "../../components/styles/Theme.styled";

// Stat card component to show the generic patient stats
function OverviewStatCard(props) {
  const [cardFlip, setCardFlip] = useState(false);

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
        <OverviewCard style={{ height: "4em", overflow: "hidden" }}>
          <CardActionArea>
            <CardContent onClick={handleClick} style={{ padding: "0.1em" }}>
              <Grid container spacing={0}>
                <Grid item xs={8}>
                  <h1
                    style={{
                      float: "left",
                      color: getColour2(props),
                      fontSize: "1.2em",
                    }}
                  >
                    {props.title}
                  </h1>
                </Grid>
                <Grid item xs={4}>
                  {" "}
                  <InfoOutlinedIcon
                    style={{ float: "right", height: "2.5vh" }}
                  />
                </Grid>
                <Grid item xs={props.noCurrentData ? 12 : 3}>
                  <h1
                    style={{
                      float: "left",
                      color: getColour(props),
                      fontSize: "1.2em",
                      fontFamily: "sans-serif",
                    }}
                  >
                    {props.value ? props.value : "Min: " + props.value1}
                  </h1>
                </Grid>
                {props.value ? (
                  <Grid item xs={3} />
                ) : (
                  <Grid item xs={1.8}>
                    <h1
                      style={{
                        float: "right",
                        color: checkDiff(props.change1),
                        fontSize: "1.2em",
                        fontFamily: "sans-serif",
                      }}
                    >
                      {props.change1}
                    </h1>
                  </Grid>
                )}

                {props.value ? (
                  <Grid item xs={3} />
                ) : (
                  <Grid item xs={5}>
                    <div style={{}}>
                      <h1
                        style={{
                          float: "right",
                          color: getColour(props),
                          fontSize: "1.2em",
                          fontFamily: "sans-serif",
                        }}
                      >
                        Max: {props.value2}
                      </h1>
                    </div>
                  </Grid>
                )}
                <Grid item xs={props.value ? 3 : 2.2}>
                  <h1
                    style={{
                      float: "right",
                      color: checkDiff(
                        props.value ? props.change : props.change2
                      ),
                      fontSize: "1.2em",
                      fontFamily: "sans-serif",
                    }}
                  >
                    {props.value ? props.change : props.change2}
                  </h1>
                </Grid>
              </Grid>
            </CardContent>
          </CardActionArea>
        </OverviewCard>
        <OverviewCard style={{ height: "4em", overflow: "hidden" }}>
          <CardActionArea>
            <CardContent onClick={handleClick} style={{ padding: "0.2em" }}>
              <div
                style={{
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
                    {props.explanation}
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

function checkDiff(diff) {
  if (diff == null || diff == "--%") {
    return "black";
  }
  var firstChar = Array.from(diff)[0];
  return firstChar === "-" ? "red" : "green";
}

const getColour = (props) => {
  if (props.selectedTheme === green) {
    return "black";
  }
  if (props.selectedTheme === blue) {
    return "black";
  }
  if (props.selectedTheme === dark) {
    return "white";
  }
  if (props.selectedTheme === highcon) {
    return "white";
  }
};

const getColour2 = (props) => {
  if (props.selectedTheme === green) {
    return "#424242";
  }
  if (props.selectedTheme === blue) {
    return "#424242";
  }
  if (props.selectedTheme === dark) {
    return "#CACACA";
  }
  if (props.selectedTheme === highcon) {
    return "#CACACA";
  }
};

export default OverviewStatCard;
