import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Authentication.css";
import {
  PatientCardThemed,
  FormInputThemed,
  FormControlThemed,
} from "../../components/styles/PatientSelectComponents.styled";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "../../components/styles/Global";
import { dark } from "../../components/styles/Theme.styled";
import { Select, MenuItem, Input } from "@mui/material";
import { useAuth } from "./AuthContext";
import Axios from "axios";

const AuthPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    institution: "",
  });

  const [selectedTheme, setSelectedTheme] = useState(dark);
  const [institutions, setInstitutions] = useState([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const currentTheme = JSON.parse(localStorage.getItem("currentTheme"));
    if (currentTheme) {
      setSelectedTheme(currentTheme);
    }

    const apiUrl =
      process.env.NODE_ENV === "production"
        ? `/api/institutions`
        : `http://localhost:5001/api/institutions`;

    Axios.get(apiUrl)
      .then((response) => {
        setInstitutions(response.data);
      })
      .catch((error) => {
        console.error("API request error for institutions:", error);
      });

    if (localStorage.getItem("isLoggedIn") === "true") {
      navigate("/home");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (e) => {
    setFormData({ ...formData, institution: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const baseUrl =
      process.env.NODE_ENV === "production"
        ? ""
        : "http://localhost:5001";

    const endpoint = `${baseUrl}/api/login`;

    try {
      const response = await Axios.post(endpoint, formData);

      if (response.data.success) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("institution", formData.institution);
        localStorage.setItem("clinicianId", response.data.clinicianId);
        localStorage.setItem("firstName", response.data.firstName);
        localStorage.setItem("lastName", response.data.lastName);
        localStorage.setItem("institutionId", response.data.institutionId);
        login();
        navigate("/home", { state: { institution: formData.institution } });
      } else {
        alert(response.data.message || "Unexpected error. Please try again.");
      }
    } catch (error) {
      alert(error.response?.data || "An error occurred. Please try again.");
    }
  };

  return (
    <ThemeProvider theme={selectedTheme}>
      <GlobalStyles />
      <div className="auth-container">
        <PatientCardThemed className="auth-card">
          <h1>Login to Dashboard</h1>

          <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
            <div className="input-row">
              <FormControlThemed style={{ width: "100%", height: "1.3em" }}>
                <Input
                  placeholder="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  inputProps={{
                    style: {color: selectedTheme.colors.mainheading, backgroundColor: selectedTheme.colors.overviewbackground, fontSize: "1.3em", padding: "0.5em" },
                  }}
                  required
                />
              </FormControlThemed>
              <FormControlThemed style={{ width: "100%", height: "1.3em" }}>
                <Input
                  placeholder="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  inputProps={{
                    style: {color: selectedTheme.colors.mainheading, backgroundColor: selectedTheme.colors.overviewbackground,fontSize: "1.3em", padding: "0.5em" },
                  }}
                  required
                />
              </FormControlThemed>
            </div>

            <FormControlThemed style={{ width: "100%", height: "1.3em" }}>
              <Select
                value={formData.institution}
                onChange={handleSelectChange}
                displayEmpty
                input={<FormInputThemed />}
                required
                sx={{
                  backgroundColor: selectedTheme.colors.overviewbackground,
                  color: selectedTheme.colors.mainheading,
                  fontSize: "0.5em",
                  paddingTop: "16px",
                }}
              >
                <MenuItem value="" disabled>
                  Select Institution
                </MenuItem>
                {institutions.map((inst) => (
                  <MenuItem key={inst.id} value={inst.name}>
                    {inst.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControlThemed>

            <button
              type="submit"
              className="full-width-button"
              style={{
                backgroundColor: selectedTheme.colors.primary,
                color: selectedTheme.colors.buttonText,
              }}
            >
              Login
            </button>
          </form>
        </PatientCardThemed>
      </div>
    </ThemeProvider>
  );
};

export default AuthPage;
