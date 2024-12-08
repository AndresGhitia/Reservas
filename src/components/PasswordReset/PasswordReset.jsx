import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import "./PasswordReset.css";

const PasswordReset = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handlePasswordReset = async (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto del formulario
        // console.log("Iniciando proceso de restablecimiento de contraseña...");
        // console.log("Email ingresado:", email);

        try {
            await sendPasswordResetEmail(auth, email);
            // console.log("Correo de restablecimiento enviado exitosamente.");
            setMessage("Se ha enviado un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada,  Asegúrese de revisar su carpeta de correo no deseado o spam si no ha recibido nuestro correo electrónico..");
            setError(""); // Limpia cualquier mensaje de error
        } catch (error) {
            console.error("Error al enviar el correo de restablecimiento:", error);
            setMessage(""); // Limpia cualquier mensaje previo de éxito
            setError("No se pudo enviar el correo. Verifica el email ingresado.");
        }
    };

    return (
        <div className="password-reset-container">
            <h1>Restablecer contraseña</h1>
            <p>Ingrese su correo electrónico para restablecer su contraseña.</p>
            <p>Se enviará un enlace para restablecer la contraseña a su correo electrónico.</p>
            <form onSubmit={handlePasswordReset}>
            <div className="form-group">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            console.log("Actualización del email:", e.target.value);
                        }}
                    />
                    <button type="submit">CONTINUAR</button>
                </div>
            </form>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
            <a href="/">Regresar al inicio</a>
        </div>
    );
};

export default PasswordReset;
