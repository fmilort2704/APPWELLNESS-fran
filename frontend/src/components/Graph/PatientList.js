import React, { useState, useEffect } from 'react';
import { OverviewCard } from "../styles/DashboardComponents.styled";

export const PatientList = ({
  clinicianId,
  selectedQuestionId,
  selectedPatient,
  selectedQuestionText // <-- Añade este prop para mostrar el texto de la pregunta
}) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientResponses, setPatientResponses] = useState([]);
  const [responsesLoading, setResponsesLoading] = useState(false);

  // Fetch the list of patients for the clinician
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/clinicians/${clinicianId}/up_users`
        );
        const data = await response.json();
        setPatients(data);
      } catch (e) {
        console.error("Error fetching patients:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [clinicianId]);

  // Fetch responses for the selected patient and question
  useEffect(() => {
    const fetchResponsesForQuestion = async () => {
      if (!selectedPatient || !selectedQuestionId) return;

      setResponsesLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5001/api/patients/${selectedPatient}/${selectedQuestionId}/answers`
        );
        const data = await response.json();
        setPatientResponses(data);
      } catch (e) {
        console.error("Error al obtener respuestas para la pregunta seleccionada:", e);
      } finally {
        setResponsesLoading(false);
      }
    };

    fetchResponsesForQuestion();
  }, [selectedQuestionId, selectedPatient]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
  responsesLoading ? (
    <div>Loading responses...</div>
  ) : selectedPatient && patientResponses.length > 0 ? (
    <OverviewCard
      style={{
        height: "auto",
        display: "block",
        margin: ".4rem",
        padding: "1em",
        boxShadow: "0 2px 8px rgba(0,0,0,0.7)",
      }}
    >
      <h2 style={{
        fontSize: ".8em",
        marginBottom: "1em",
        width: "100%",
        textAlign: "left"
      }}>
        {patientResponses[0].question.split("0 =")[0]}
      </h2>
      <ul>
        {patientResponses.map((response, index) => (
          <li key={index} style={{ fontSize: "0.5em" , textAlign: "left"}}>
            {response.answer}
          </li>
        ))}
      </ul>
    </OverviewCard>
  ) : !selectedQuestionId ? (
    <div>Please select a question to view responses.</div>
  ) : selectedPatient ? (
    <div>No responses available for this patient.</div>
  ) : null
);
};

export default PatientList;