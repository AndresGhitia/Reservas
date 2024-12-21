import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import "./BPNews.css"; 

const BPNews = ({ db, userDocId }) => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      if (!userDocId) {
        setError("No se proporcionó el ID del usuario.");
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, "owners", userDocId);
      try {
        const docSnapshot = await getDoc(userDocRef);
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (data && data.news) {
            setNewsList(data.news);
            console.log("Noticias cargadas:", data.news);
          } else {
            setError("No se encontraron noticias.");
          }
        } else {
          setError("No se encontró el documento del usuario.");
        }
      } catch (err) {
        console.error("Error al cargar las noticias:", err);
        setError("No se pudieron cargar las noticias.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [db, userDocId]);

  return (
    <div className="bpnews-container">
      <h2>Novedades!</h2>
      {loading ? (
        <p>Cargando noticias...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : newsList.length === 0 ? (
        <p>No hay noticias disponibles.</p>
      ) : (
        <ul className="bpnews-list">
          {newsList.map((news) => (
            <li key={news.title} className="bpnews-item"> 
              <h3>{news.title}</h3>
              <p>{news.content}</p>
              {/* <span>{news.date}</span> */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BPNews;
