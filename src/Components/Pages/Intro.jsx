import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Intro.css';
import introImage from '../Assets/intro.png'; 

const Intro = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const navigateToGenerator = () => {
        navigate('/generate');
    }

    const navigateToPhotoToAvatar = () => {
        navigate('/photo-to-avatar');
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.name.toLowerCase().includes('avatar')) {
            console.log('Archivo seleccionado:', file);
            navigate('/generate', { state: { avatar: file } });
        } else {
            alert('Por favor selecciona un archivo que contenga "avatar" en su nombre.');
        }
    }

    const openFileDialog = () => {
        fileInputRef.current.click();
    }

    return (
        <div className="intro-page">
            <div className="header">Bienvenido al generador de Avatares personalizados para O-CITY</div>
            <img src={introImage} alt="Intro" className="intro-image"/>
            <div className="content">
                <p className="intro-text">
                    En <span className="highlight">O-CITY</span>, puedes crear avatares personalizados para que te guíen en el mapa de <span className="highlight">O-CITY</span>. 
                    Sigue estos sencillos pasos para generar tu avatar:
                </p>
                <ol className="instructions-list">
                    <li>✏️ Escribe una descripción de cómo quieres que se vea tu avatar en el campo de texto. (Por ejemplo, hombre de 50 años con pelo blanco, bigote y vestido de un traje negro.)</li>
                    <li>🎨 Selecciona el estilo de tu avatar en el menú desplegable. Puedes elegir entre estilos como 3D, caricatura, realista y anime.</li>
                    <li>⚙️ Haz clic en el botón "Crear" para generar tu avatar. Puedes generar hasta cuatro avatares diferentes a la vez.</li>
                    <li>👆 Haz clic en el avatar que más te guste para seleccionarlo.</li>
                    <li>💾 Haz clic en "Descargar Avatar" para guardar tu avatar seleccionado en tu dispositivo y poder usarlo en <span className="highlight">O-CITY</span>.</li>
                </ol>
                

                <div className="content">
                    <p className="intro-text">
                        También puedes convertir una foto existente en un avatar siguiendo estos pasos:
                    </p>
                    <ol className="instructions-list">
                        <li>📷 Selecciona una foto desde tu dispositivo haciendo clic en "Convertir Foto en Avatar".</li>
                        <li>🖼️ Asegúrate de que la foto sea clara y de buena calidad para obtener mejores resultados.</li>
                        <li>🔄 Haz clic en "Subir y Convertir" para convertir tu foto en un avatar.</li>
                        <li>💾 Descarga el avatar generado y úsalo en <span className="highlight">O-CITY</span>.</li>
                    </ol>
                </div>
                <p className="intro-text">
                    ¡Comienza a crear tus avatares interactivos ahora!
                </p>
                <button className="start-button" onClick={navigateToGenerator}>Empezar</button>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileSelect}
                />
                <button className="import-button" onClick={openFileDialog}>Ya tengo un Avatar</button>
                <button className="photo-to-avatar-button" onClick={navigateToPhotoToAvatar}>Convertir Foto en Avatar</button>
            </div>
        </div>
    );
}

export default Intro;
