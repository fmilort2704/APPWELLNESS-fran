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
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

const AuthPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    institution: "",
    email: "",
  });

  const [selectedTheme, setSelectedTheme] = useState(dark);
  const [institutions, setInstitutions] = useState([]);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mfaCode, setMfaCode] = useState("");
  const [userId, setUserId] = useState(null);
  const [step, setStep] = useState(0);
  const [loginResponse, setLoginResponse] = useState(null);
  const [userType, setUserType] = useState("clinician");

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

  const handleBack = () => {
    if (step === 2) {
      setStep(0);
    } else if (userType !== null) {
      setUserType(null);
    }
  };

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

    const endpoint =
      userType === "clinician" ? `${baseUrl}/api/login` : `${baseUrl}/api/loginUser`;

    try {
      const response = await Axios.post(endpoint, formData);

      if (response.data.success) {
        console.log("Login successful:", response.data);

        if (userType === "clinician") {
          const emailResponse = await Axios.post(`${baseUrl}/api/select-email`, {
            clinicianId: response.data.clinicianId,
          });

          const email = emailResponse.data.email;

          await Axios.post(`${baseUrl}/api/send-mfa-code`, {
            clinicianId: response.data.clinicianId,
            email,
          });

          setLoginResponse(response.data);
        } else if (userType === "user") {
          const email = formData.email;

          await Axios.post(`${baseUrl}/api/send-mfa-code`, {
            userId: response.data.userId,
            email,
          });

          setUserId(response.data.userId);
        }

        setStep(2); 
      } else {
        alert(response.data.message || "Unexpected error. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert(error.response?.data || "An error occurred. Please try again.");
    }
  };

  /*if (userType === null) {
    return (
      <ThemeProvider theme={selectedTheme}>
        <GlobalStyles />
        <div className="auth-container">
          <PatientCardThemed className="auth-card">
            <h1>Please select your role</h1>
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: "20px" }}>
              <button
                className="full-width-button"
                style={{
                  backgroundColor: selectedTheme.colors.primary,
                  color: selectedTheme.colors.buttonText,
                  width: "45%",
                }}
                onClick={() => setUserType("user")}
              >
                User
              </button>
              <button
                className="full-width-button"
                style={{
                  backgroundColor: selectedTheme.colors.primary,
                  color: selectedTheme.colors.buttonText,
                  width: "45%",
                }}
                onClick={() => setUserType("clinician")}
              >
                Clinician
              </button>
            </div>
          </PatientCardThemed>
        </div>
      </ThemeProvider>
    );
  }*/

  const handleVerifyCode = async () => {
    try {
      const baseUrl =
        process.env.NODE_ENV === "production"
          ? ""
          : "http://localhost:5001";
      let payload;
      if (userType === "user") {
        payload = { userId, code: mfaCode };
      } else {
        payload = { clinicianId: loginResponse.clinicianId, code: mfaCode };
      }
      console.log("Payload to send:", payload);

      const res = await Axios.post(`${baseUrl}/api/verify-mfa`, payload);

      if (res.data.success) {
        localStorage.setItem("isLoggedIn", "true");
        if (userType === "clinician") {
          localStorage.setItem("institution", formData.institution);
          localStorage.setItem("clinicianId", loginResponse.clinicianId);
          localStorage.setItem("firstName", loginResponse.firstName);
          localStorage.setItem("lastName", loginResponse.lastName);
          localStorage.setItem("institutionId", loginResponse.institutionId);
          login();
          navigate("/home", {
            state: { institution: formData.institution, userType: "clinician" },
          });
        } else {
          localStorage.setItem("patientId", userId);
          navigate("/dashboard", {
            state: { id: userId, userType: "user" },
          });
        }
      } else {
        alert("Incorrect code.");
      }
    } catch (err) {
      alert("Error verifying code.");
    }
  };

  if (step === 2) {
    return (
      <ThemeProvider theme={selectedTheme}>
        <GlobalStyles />
        <div className="auth-container">
          <PatientCardThemed className="auth-card">
            <h1><ArrowBackIosNewIcon
              style={{ cursor: "pointer", marginRight: "8px" }}
              onClick={handleBack}
            />Code verification</h1>
            <p>Introduce the code that we sent to your email</p>
            <FormControlThemed style={{ width: "100%", marginBottom: "1em" }}>
              <Input
                placeholder="Verification code"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                inputProps={{
                  style: {
                    color: selectedTheme.colors.mainheading,
                    backgroundColor: selectedTheme.colors.overviewbackground,
                    fontSize: "1.3em",
                    padding: "0.5em",
                  },
                }}
              />
            </FormControlThemed>
            <button
              className="full-width-button"
              type="submit"
              onClick={handleVerifyCode}
              style={{
                backgroundColor: selectedTheme.colors.primary,
                color: selectedTheme.colors.buttonText,
              }}
            >
              Verify code
            </button>
          </PatientCardThemed>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={selectedTheme}>
      <GlobalStyles />
      <div className="auth-container">
        <PatientCardThemed className="auth-card">
          <h1><ArrowBackIosNewIcon
            style={{ cursor: "pointer", marginRight: "8px" }}
            onClick={handleBack}
          />Login to Dashboard</h1>
          <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
            {userType === "clinician" && (
              <>
                <div className="input-row">
                  <FormControlThemed style={{ width: "100%", height: "1.3em" }}>
                    <Input
                      placeholder="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      inputProps={{
                        style: {
                          color: selectedTheme.colors.mainheading,
                          backgroundColor: selectedTheme.colors.overviewbackground,
                          fontSize: "1.3em",
                          padding: "0.5em",
                        },
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
                        style: {
                          color: selectedTheme.colors.mainheading,
                          backgroundColor: selectedTheme.colors.overviewbackground,
                          fontSize: "1.3em",
                          padding: "0.5em",
                        },
                      }}
                      required
                    />
                  </FormControlThemed>
                </div>
                <FormControlThemed style={{ width: "100%", height: "1.3em" }}>
                  <Input
                    placeholder="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    inputProps={{
                      style: {
                        color: selectedTheme.colors.mainheading,
                        backgroundColor: selectedTheme.colors.overviewbackground,
                        fontSize: "1.3em",
                        padding: "0.5em",
                      },
                    }}
                    required
                  />
                </FormControlThemed>
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
              </>
            )}
            {userType === "user" && (
              <>
                <FormControlThemed style={{ width: "100%", height: "1.3em" }}>
                  <Input
                    placeholder="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    inputProps={{
                      style: {
                        color: selectedTheme.colors.mainheading,
                        backgroundColor: selectedTheme.colors.overviewbackground,
                        fontSize: "1.3em",
                        padding: "0.5em",
                      },
                    }}
                    required
                  />
                </FormControlThemed>
                <FormControlThemed style={{ width: "100%", height: "1.3em" }}>
                  <Input
                    placeholder="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    inputProps={{
                      style: {
                        color: selectedTheme.colors.mainheading,
                        backgroundColor: selectedTheme.colors.overviewbackground,
                        fontSize: "1.3em",
                        padding: "0.5em",
                      },
                    }}
                    required
                  />
                </FormControlThemed>
              </>
            )}
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