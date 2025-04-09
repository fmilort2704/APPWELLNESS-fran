import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
    background-color: ${({ theme }) => theme.colors.dashboardbackground};
    color: ${({ theme }) => theme.colors.mainheading};
    display: flex;
    flex-direction: column;
    font-size: 24px;
    gap: 32px;
    flex: 1;
}

`;