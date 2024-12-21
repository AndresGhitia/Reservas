import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import "./BPNews.css"; 

const BPNews = ({ db, userDocId }) => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cargar las noticias al montar el componente
  useEffect(() => {
    const fetchNews = async () => {
      if (!userDocId) return;

      const userDocRef = doc(db, "owners", userDocId);
      try {
        const docSnapshot = await getDoc(userDocRef);
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (data.news) {
            setNewsList(data.news);

            console.log('noticias' +newsList)
          }
        } else {
          setError("No se encontraron noticias.");
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
      <h2>Noticias</h2>
      {loading ? (
        <p>Cargando noticias...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : newsList.length === 0 ? (
        <p>No hay noticias disponibles.</p>
      ) : (
        <ul className="bpnews-list">
          {newsList.map((news, index) => (
            <li key={index} className="bpnews-item">
              <h3>{news.title}</h3>
              <p>{news.content}</p>
              <span>{news.date}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BPNews;
