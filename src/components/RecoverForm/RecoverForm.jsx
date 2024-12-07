import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import './RecoverForm.css';

const RecoverForm = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email'); // Obtener el correo del query param

    console.log("Correo electrónico recibido:", email);

    const [formData, setFormData] = useState({
        address: '',
        businessType: '',
        establishmentName: '',
        ownerName: '',
        whatsapp: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('El correo electrónico no está disponible.');
            return;
        }

        setLoading(true);

        try {
            // Buscar el documento por el campo "establishmentEmail"
            const q = query(collection(db, 'owners'), where('establishmentEmail', '==', email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error('No se encontró un documento con ese correo electrónico.');
            }

            // Obtener el ID del primer documento que coincida
            const docId = querySnapshot.docs[0].id;
            console.log("ID del documento encontrado:", docId);

            // Referencia al documento encontrado
            const userDocRef = doc(db, 'owners', docId);

            // Obtener el Timestamp actual
            const currentTimestamp = serverTimestamp();

            // Actualizar los datos del documento
            await updateDoc(userDocRef, {
                address: formData.address || '',
                businessType: formData.businessType || '',
                establishmentName: formData.establishmentName || '',
                ownerName: formData.ownerName || '',
                whatsapp: formData.whatsapp || '',
                status: 'enabled', // Cambiar estado a 'enabled'
                expdate: currentTimestamp, // Actualizar expdate con el Timestamp actual
                statusHistory: arrayUnion(`enabled: ${new Date().toISOString()}`), // Agregar "enabled" con la fecha actual al array
            });

            setLoading(false);
            alert('Datos actualizados correctamente');
        } catch (err) {
            setLoading(false);
            setError(err.message || 'Hubo un error al actualizar los datos.');
            console.error(err);
        }
    };

    return (
        <div>
            <h2>Recuperar y Actualizar Datos</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Dirección</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Tipo de Negocio</label>
                    <input
                        type="text"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Nombre del Establecimiento</label>
                    <input
                        type="text"
                        name="establishmentName"
                        value={formData.establishmentName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Nombre del Propietario</label>
                    <input
                        type="text"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>WhatsApp</label>
                    <input
                        type="text"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Cargando...' : 'Actualizar'}
                </button>
            </form>
            <a href="/">Regresar al inicio</a>
        </div>
    );
};

export default RecoverForm;
