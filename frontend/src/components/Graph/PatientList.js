import React, { useState, useEffect } from 'react';

export const PatientList = ({ clinicianId, selectedQuestionId, selectedPatient, }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientResponses, setPatientResponses] = useState([]);
  const [responsesLoading, setResponsesLoading] = useState(false);

  // Fetch the list of patients for the clinician
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        console.log("Fetching patients for clinician:", clinicianId);
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
        console.log("Respuestas actualizadas para la pregunta seleccionada:", data);
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
    <div>
      <h3>Last entries</h3>

      {responsesLoading ? (
        <div>Loading responses...</div>
      ) : selectedPatient && patientResponses.length > 0 ? (
        <div>
          <h4>Responses for Patient {selectedPatient}</h4>
          <ul>
            {patientResponses.map((response, index) => (
              <li key={index}>
                <div style={{ fontSize: "1.25rem" }}>
                  <strong>Question: {response.question.split("0 =")[0]}</strong>
                </div>
                <div style={{ fontSize: "1rem" }}>Answer: {response.answer}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : !selectedQuestionId ? (
        <div>Please select a question to view responses.</div>
      ) : selectedPatient ? (
        <div>No responses available for this patient.</div>
      ) : null}
    </div>
  );
};

export default PatientList;