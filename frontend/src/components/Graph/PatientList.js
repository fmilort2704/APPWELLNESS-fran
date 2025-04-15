import React, { useState, useEffect } from 'react';

export const PatientList = ({clinicianId}) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientResponses, setPatientResponses] = useState([]);
    const [responsesLoading, setResponsesLoading] = useState(false);

    useEffect(()=>{
        const fetchPatients = async () => {
            try {  
                console.log("Fetching patients for clinician:", clinicianId);
                const response = await fetch(`http://localhost:5001/api/clinicians/${clinicianId}/up_users`);
                const data = await response.json();
                setPatients(data);
            } catch (e) {
                console.error("Error fetching patients:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients()
    }, [clinicianId]);

    const handlePatientSelect = async (patientId) => {
        console.log("Id del paciente: " + patientId);
        setSelectedPatient(patientId);
        setResponsesLoading(true);
        try {
            const response = await fetch(`http://localhost:5001/api/patients/${patientId}/answers`);
            const data = await response.json();
            setPatientResponses(data);
        } catch (e) {
            console.error("Error fetching patient responses:", e);
        } finally {
            setResponsesLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h3>Patients</h3>
            <select
                onChange={(e) => handlePatientSelect(e.target.value)}
                defaultValue=""
                style={{ marginBottom: "1rem", padding: "0.5rem" }}
            >
                <option value="" disabled>
                    Select a patient
                </option>
                {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                        {patient.username}
                    </option>
                ))}
            </select>

            {responsesLoading ? (
                <div>Loading responses...</div>
            ) : selectedPatient && patientResponses.length > 0 ? (
                <div>
                    <h4>Responses for Patient {selectedPatient}</h4>
                    <ul>
                        {patientResponses.map((response, index) => (
                            <li key={index}>
                                <div style={{fontSize: "1.25rem"}}>{response.question.split("0 =")[0]}</div>
                                <div style={{fontSize: "1rem"}}>{response.answer}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : selectedPatient ? (
                <div>No responses available for this patient.</div>
            ) : null}
        </div>
    );
}

export default PatientList;