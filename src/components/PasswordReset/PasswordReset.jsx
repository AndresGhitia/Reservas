import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import "./PasswordReset.css";

const PasswordReset = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("Se ha enviado un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.");
            setError("");
        } catch (error) {
            setMessage("");
            setError("No se pudo enviar el correo. Verifica el email ingresado.");
        }
    };

    return (
        <div class="password-reset-container">
            <hr />
            <h1>Restablecer contraseña</h1>
            <hr />
            <div class="password-reset-info">
                <p>Ingrese su correo electrónico para restablecer su contraseña.</p>
            </div>
            <p>Se enviará un enlace para restablecer la contraseña a su correo electrónico. Asegúrese de revisar su carpeta de correo no deseado o spam si no ha recibido nuestro correo electrónico.</p>
            <div class="form-group">
                <input type="email" placeholder="Email" />
                <button>CONTINUAR</button>
            </div>
            <a href="/">Regresar al inicio</a>
        </div>
    );
};

export default PasswordReset;
