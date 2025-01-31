import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import Swal from "sweetalert2";
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

    // Validar si ya hay 5 noticias
    if (newsList.length >= 5 && editingIndex === null) {
      await Swal.fire({
        title: "Límite de noticias alcanzado",
        text: "Ya tienes publicadas el máximo de 5 noticias. Para agregar una nueva, debes borrar una publicación antigua.",
        icon: "warning",
        confirmButtonText: "Entendido",
      });
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

      await Swal.fire({
        title: "Noticia guardada correctamente.",
        text: "",
        icon: "success",
        confirmButtonText: "Entendido",
      });
    } catch (err) {
      console.error("Error al guardar la noticia:", err);
      setError("Hubo un error al guardar la noticia.");
    }
    setLoading(false);
  };

  const handleDeleteNews = async (index) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la publicación de forma permanente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const userDocRef = doc(db, "owners", userDocId);
      const updatedNewsList = newsList.filter((_, i) => i !== index);

      await updateDoc(userDocRef, { news: updatedNewsList }); // Actualizar en Firestore

      setNewsList(updatedNewsList);
      await Swal.fire({
        title: "Eliminado",
        text: "La noticia se ha eliminado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
    } catch (err) {
      console.error("Error al eliminar la noticia:", err);
      setError("Hubo un error al eliminar la noticia.");
      await Swal.fire({
        title: "Error",
        text: "No se pudo eliminar la noticia. Intenta nuevamente.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
    setLoading(false);
  };

  // Editar noticia
  const handleEditNews = (index) => {
    const newsToEdit = newsList[index];
    setTitle(newsToEdit.title);
    setContent(newsToEdit.content);
    setEditingIndex(index);

    const addContainer = document.querySelector(".news-add-container");
    if (addContainer) {
      addContainer.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="news-page">
      {/* Contenedor para "Agregar Noticias" */}
      <div className="news-add-container">
        <div className="news-add-header">
          <h1>{editingIndex !== null ? "Editar Noticia" : "Agregar Noticia"}</h1>
        </div>
        <div className="news-elements">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título de la noticia"
            className="news-input"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Desarrollo de la publicación"
            className="news-textarea"
          />
          {error && <p className="error-message">{error}</p>}
          <button className="add-news-button" onClick={handleAddNews} disabled={loading}>
            {loading
              ? "GUARDANDO..."
              : editingIndex !== null
                ? "ACTUALIZAR NOTICIA"
                : "AGREGAR NOTICIA"}
          </button>
        </div>
      </div>

      <div className="news-list-container">
        <div className="news-list-header">
          <h1>Novedades</h1>
        </div>
        <div className="news-list">
          {newsList.length === 0 ? (
            <p>No hay noticias agregadas.</p>
          ) : (
            <ul>
              {newsList.map((news, index) => (
                <li key={index}>
                  <h3>{news.title}</h3>
                  <span>{news.content}</span>
                  <span>{news.date}</span>
                  <div className="news-buttons">
                    <button className="edit-news-button" onClick={() => handleEditNews(index)}>
                      Editar
                    </button>
                    <button className="delete-news-button" onClick={() => handleDeleteNews(index)}>
                      Borrar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default News;