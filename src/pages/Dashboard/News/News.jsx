import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import "./News.css"; // Archivo CSS para los estilos

const News = ({ db, userDocId }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  // Cargar las noticias existentes al iniciar
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
          }
        }
      } catch (err) {
        console.error("Error al cargar las noticias:", err);
        setError("No se pudieron cargar las noticias.");
      }
    };

    fetchNews();
  }, [db, userDocId]);

  // Guardar noticia en Firebase
  const handleAddNews = async () => {
    if (!title || !content) {
      setError("Completa todos los campos.");
      return;
    }

    setLoading(true);
    try {
      const userDocRef = doc(db, "owners", userDocId);
      const newNews = { title, content, date: new Date().toLocaleDateString() };
      let updatedNewsList;

      if (editingIndex !== null) {
        updatedNewsList = newsList.map((news, index) =>
          index === editingIndex ? newNews : news
        );
      } else {
        updatedNewsList = [...newsList, newNews]; // Agregar nueva noticia
      }

      await updateDoc(userDocRef, { news: updatedNewsList }); // Actualizar en Firestore

      setNewsList(updatedNewsList);
      setTitle(""); // Limpiar campos
      setContent("");
      setEditingIndex(null);
      setError("");
      alert("Noticia guardada correctamente.");
    } catch (err) {
      console.error("Error al guardar la noticia:", err);
      setError("Hubo un error al guardar la noticia.");
    }
    setLoading(false);
  };

  // Eliminar noticia
  const handleDeleteNews = async (index) => {
    const confirmDelete = window.confirm("¿Deseas borrar esta publicación?");
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const userDocRef = doc(db, "owners", userDocId);
      const updatedNewsList = newsList.filter((_, i) => i !== index);

      await updateDoc(userDocRef, { news: updatedNewsList }); // Actualizar en Firestore

      setNewsList(updatedNewsList);
      alert("Noticia eliminada correctamente.");
    } catch (err) {
      console.error("Error al eliminar la noticia:", err);
      setError("Hubo un error al eliminar la noticia.");
    }
    setLoading(false);
  };

  // Editar noticia
  const handleEditNews = (index) => {
    const newsToEdit = newsList[index];
    setTitle(newsToEdit.title);
    setContent(newsToEdit.content);
    setEditingIndex(index);
  };

  return (
    <div className="news-container">
      <h2>{editingIndex !== null ? "Editar Noticia" : "Agregar Noticia"}</h2>

      {/* Campo para el título */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título de la noticia"
        className="news-input"
      />

      {/* Campo para el contenido */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Desarrollo de la publicación"
        className="news-textarea"
      />

      {error && <p className="error-message">{error}</p>}

      {/* Botón para agregar o actualizar noticia */}
      <button
        className="add-news-button"
        onClick={handleAddNews}
        disabled={loading}
      >
        {loading ? "Guardando..." : editingIndex !== null ? "Actualizar Noticia" : "Agregar Noticia"}
      </button>

      {/* Mostrar lista de noticias */}
      <div className="news-list">
        <h3>Noticias</h3>
        {newsList.length === 0 ? (
          <p>No hay noticias agregadas.</p>
        ) : (
          <ul>
            {newsList.map((news, index) => (
              <li key={index}>
                <strong>{news.title}</strong>
                <p>{news.content}</p>
                <span>{news.date}</span>
                <button
                  className="edit-news-button"
                  onClick={() => handleEditNews(index)}
                >
                  Editar
                </button>
                <button
                  className="delete-news-button"
                  onClick={() => handleDeleteNews(index)}
                >
                  Borrar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default News;
