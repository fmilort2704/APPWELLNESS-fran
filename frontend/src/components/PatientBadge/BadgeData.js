import React, { useEffect, useState } from "react";
import "./BadgeData.css";
import defaultAvatar from "../../components/PatientBadge/img/no_photo.jpg";

const PatientCard = ({ name, theme, email, group, userId }) => {
    const [user, setUser] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showImage, setShowImage] = useState(false);


    useEffect(() => {
        const fetchBadgeData = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/badgeData/${userId}/up_users`);
                if (!response.ok) throw new Error("Error fetching data");

                const data = await response.json();
                console.log("Badge data:", data);
                setUser(data);
            } catch (error) {
                console.error("Error fetching badge data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchBadgeData();
        }
    }, [userId]);

    return (
        <div className="bg-white shadow-md rounded-2xl p-6 max-w-md w-full" style={{ backgroundColor: theme.colors.graphcardbackground, margin: "2.2rem .5rem", padding: ".5rem", borderRadius: ".5rem" }}>
            <h3 className="text-xl font-bold text-gray-800 mb-4">User profile</h3>
            <div className="space-y-2" style={{ fontSize: "1rem" }}>
                {user.length > 0 ? (
                    <>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem"
                        }}>
                            <img
                                src={user[0].photo|| defaultAvatar}
                                alt="Foto del paciente"
                                onClick={() => setShowImage(!showImage)}
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: "2px solid #fff",
                                    boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                                    cursor: "pointer"
                                }}
                            />
                            <p><span style={{ fontWeight: "bold" }}>Name: </span>{user[0].full_name}</p>
                        </div>

                        <p><span style={{ fontWeight: "bold" }}>Email:</span> <a
                            style={{ textDecoration: "none", color: "inherit" }}
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${user[0].email}&body=Hi ${user[0].full_name},`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {user[0].email}
                        </a>
                        </p>
                        <p><span style={{ fontWeight: "bold" }}>Groups:</span>
                            {user.map((e, index) => (
                                <div key={index}>-{e.title}</div>
                            ))}
                        </p>
                    </>
                ) : loading ? (
                    <p>Cargando información del paciente...</p>
                ) : (
                    <p>No se encontraron datos del paciente.</p>
                )}
            </div>
            {showImage && (
                <div
                    style={{
                        position: "absolute",
                        top: "70px",
                        right: 0,
                        backgroundColor: "white",
                        padding: "0.5rem",
                        borderRadius: "0.5rem",
                        boxShadow: "0 0 0 rgba(0,0,0,0)", 
                        zIndex: 10,
                        transform: "scale(0.95)",
                        opacity: 0,
                        animation: "fadeInZoom 0.3s forwards"
                    }}
                >
                    <img
                        src={user[0].photo || defaultAvatar}
                        alt="Imagen ampliada"
                        style={{
                            width: "150px",
                            height: "150px",
                            objectFit: "cover",
                            borderRadius: "0.75rem"
                        }}
                        onClick={() => setShowImage(false)}
                    />
                </div>
            )}


        </div>
    );
};

export default PatientCard;
