import styled from "styled-components";
import React from "react";
import Toolbar from "@mui/material/Toolbar";
import Drawer from "@mui/material/Drawer";
import {
  TableRow,
  TableHead,
  TableCell,
  Table,
  TableFooter,
  FormControl,
  Fab,
} from "@mui/material";
import InputBase from "@mui/material/InputBase";
import Dialog from "@mui/material/Dialog";

// The following defines the styling of components of the dashboard screen

export const ToolbarThemed = styled(Toolbar)`
  background-color: ${({ theme }) => theme.colors.header};
  color: ${({ theme }) => theme.colors.headertext};
  boxshadow: "none";
  height: 4vh;
  text-align: center;
  display: flex;
`;

export const SidebarThemed = styled(Drawer)`
  .MuiDrawer-paper {
    z-index: 0;
    background-color: ${({ theme }) => theme.colors.sidebar}
    }}
`;

export const StatCard = styled.section`
  background: ${({ theme }) => theme.colors.statcardbackground};
  color: ${({ theme }) => theme.colors.statcardtext};
  box-shadow: 3;
  border-radius: 0.2vw;
  padding: 0.5em;
  box-shadow: -4px 4px rgba(0, 0, 0, 0.15);
  display: flex;
  align-self: center;
  justify-content: center;
`;

export const OverviewCard = styled.section`
  background: ${({ theme }) => theme.colors.overviewbackground};
  padding: 0.5em;
  height: 13vh;
  border-radius: 0.2vw;
  // box-sizing: border-box;
  box-shadow: -4px 4px rgba(0, 0, 0, 0.15);
  display: flex;
  overflow: auto;
`;




export const StatsBox = styled.section`
  background: ${({ theme }) => theme.colors.statcardbox};
  border-radius: 0.2vw;
  overflow: auto;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  //height: 100%;
  margin: auto;
  display: flex;
  flex-direction: column;
  padding-top: 0.5em;
  padding-bottom: 0.5em;
  gap: 15px;
`;


export const HelpBox = styled(Dialog)`
  .MuiPaper-root {
    background-color: ${({ theme }) => theme.colors.sidebar};
    overflow-y: auto;
    border-radius: 0.2vw;
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    margin: auto;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
`;


export const BadgePopupBox = styled(Dialog)`
  .MuiPaper-root {
    background-color: ${({ theme }) => theme.colors.dashboardbackground};
    color: ${({ theme }) => theme.colors.statcardtext};

    border-radius: 0.2vw;
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    margin: auto;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
`;

export const GraphCard = styled.section`
  width: 70%;
  padding-right: 10px;
  padding-left: 10px;
  background: ${({ theme }) => theme.colors.graphcardbackground};
  border-radius: 0.2vw;
  border-width: 5px solid #000000;
  box-shadow: -4px 4px rgba(0, 0, 0, 0.15);
  overflow: auto;
  height: 100%;
  // max-height:53vh;
`;

export const DashboardTheme = styled.div`
  text-align: center;
  background: ${({ theme }) => theme.colors.dashboardbackground};
  align-content: center;
  flex: 1;
  min-height: 100vh;
  display: flex;
  width: 100vw;
  flex-direction: column;
`;
export const Footer = styled.footer`
  background-color: ${({ theme }) => theme.colors.footer};
  height: 5vh;
  text-align: center;
  display: flex;
  margin-top: 64px;
`;

export const BreakdownCardHolder = styled.section`
  background-color: ${({ theme }) => theme.colors.cardHolders};
`;
export const CardRowThemed = styled.section`
    background-color: ${({ theme }) => theme.colors.cardHolders};
    padding: 0.5em;
    display: grid;
    flex-direction: row;
    justify-content: space-evenly;
    gap: 0.5em;
    overflow-y: hidden;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin: 0 auto;
    overflow-x: auto;
    border-radius: 0.2vw;
}
`;
export const RefreshButton = styled.button`
  borderColor:'rgba(0,0,0,0.2)',
  alignItems:'center',
  justifyContent:'center',
  width:100,
  height:100,
  backgroundColor:'#fff',
  border-radius:100px,
`;

export const FormControlThemed = styled(FormControl)`
  height: 62px;
  font-family: Raleway, sans-serif;
  font-size: 1.1em;
  border-radius: 0.2vw;
  background-color: ${({ theme }) => theme.colors.sidebar};
`;

export const FormInputThemed = styled(InputBase)`
  position: 'relative',
  border: '1px solid #ced4da',
  fontSize: 50px,
  padding: '10px 26px 10px 12px',  
  borderRadius: 0.5vw,
  boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
  font-family: Raleway, sans-serif;
  font-weight: 500;

  // '& .MuiInputBase-input': {
  //   position: 'relative',
  //   backgroundColor: theme.colors.sidebar,
  //   border: '1px solid #ced4da',
  //   fontSize: 40,
  //    padding: '10px 26px 10px 12px',
  //     borderRadius: 0.5vw,
  //     borderColor: '#80bdff',
  //     boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
  //   },
  },
`;
