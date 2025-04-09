import { Card } from "@mui/material";
import React from "react";
//import styled from "styled-components";
import { StatCard } from "../styles/DashboardComponents.styled";
// TODO remove? Outdated?
function KeyStatCard({ name }) {
  return (
    <StatCard>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginRight: "5px",
          alignContent: "start",
          alignSelf: "start",
        }}
      >
        <h3
          style={{
            fontFamily: "Palanquin Dark, sans-serif",
            display: "flex",
            flexDirection: "column",
            fontSize: "25px",
            textAlign: "start",
            margin: "5px",
            marginBottom: "5px",
          }}
        >
          Key Stats:
        </h3>

        <p
          style={{
            fontFamily: "Palanquin, sans-serif",
            lineHeight: "1.2em",
            fontSize: "25px",
            textAlign: "start",
            margin: "5px",
            marginRight: "-2px",
          }}
        >
          {/* TODO: update with data values for the filtered value*/}

          <li>
            <b>23%</b> increase in average weekly {name.toLowerCase()} from
            previous week
          </li>
          <li>
            <b>10%</b> decrease in average monthly {name.toLowerCase()} from
            previous month
          </li>
          <li>
            <b>10%</b> decrease in average monthly {name.toLowerCase()} from
            previous month
          </li>
          <li>
            <b>10%</b> decrease in average monthly {name.toLowerCase()} from
            previous month
          </li>
        </p>
      </div>
    </StatCard>
    // </Card>
  );
}

export default KeyStatCard;
