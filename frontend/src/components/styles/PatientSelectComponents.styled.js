import styled from "styled-components";
import {
  TableRow,
  TableHead,
  TableCell,
  Table,
  TableFooter,
  FormControl,
} from "@mui/material";
import InputBase from "@mui/material/InputBase";

// The following defines the styling of components of the patient select screen

export const PatientCardThemed = styled.button`
  background-color: ${({ theme }) => theme.colors.overviewbackground};
  color: ${({ theme }) => theme.colors.statcardtext};
  border-radius: 20px;
  border: none;
`;
export const PatientRowThemed = styled.section`
  display: flex;
  flex-direction: row;
  justify-self: center;
  max-width: 100%;
  margin: 0 auto;
  gap: 1em;
  padding: 0.75em;
  justify-content: flex-start;
  overflow-x: auto;
  overflow-y: hidden;
  background-color: ${({ theme }) => theme.colors.cardHolders};
  border-radius: calc(5px + 0.75em);
`;
export const PatientTableThemed = styled(Table)`
  width: 100%;
  border-collapse: collapse;
  background-color: ${({ theme }) => theme.colors.sidebar},
  text-align: center;
  overflow: auto;
`;
export const PatientTableHeadThemed = styled(TableHead)`
  background-color: ${({ theme }) => theme.colors.header};
`;
export const PatientTableRowThemed = styled(TableRow)`
  background-color: ${({ theme }) => theme.colors.sidebar};
`;
export const PatientTableCellThemed = styled(TableCell)`
  padding: 8px;
  font-family: Raleway, sans-serif;
  font-weight: 500;
`;
export const PatientTableFootThemed = styled(TableFooter)`
  // border: 1px solid;
  padding: 8px;
  height: 10px;
  z-index:1;
  position: 'sticky'
  background-color: ${({ theme }) => theme.colors.header}
`;
export const FormControlThemed = styled(FormControl)`
  height: 3vh;
  font-family: Raleway, sans-serif;
  width: 5vw;
  font-size: 40px;
  border-radius: 0.2vw;
  background-color: ${({ theme }) => theme.colors.sidebar};
`;

export const FormInputThemed = styled(InputBase)`
  position: 'relative',
  border: '1px solid #ced4da',
  fontSize: 40,
  font-family: Raleway, sans-serif,
  padding: '10px 26px 10px 12px',  
  borderRadius: 0.5vw,
  boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',

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
export const Footer = styled.footer`
  background-color: ${({ theme }) => theme.colors.footer};
  height: 5vh;
  text-align: center;
  display: flex;
  margin-top: 64px;
`;
