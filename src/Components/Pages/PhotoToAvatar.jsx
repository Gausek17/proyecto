import React, { useState, useRef } from 'react';
import axios from 'axios';
import './PhotoToAvatar.css';

const avatarTypes = [
    { value: '0', label: 'Magic Mirror Avatar' },
    { value: '1', label: 'Fairy Avatar' },
    { value: '2', label: 'Dreamland Avatar' },
    { value: '3', label: 'Manga Avatar' },
    { value: '4', label: 'K-POP Avatar' },
    { value: '5', label: 'K-POP' },
    { value: '6', label: 'Pixel' },
    { value: '7', label: 'Smile Avatar' },
    { value: '8', label: 'Magic Mirror' },
    { value: '9', label: 'American Comic Avatar' },
    { value: '10', label: 'American Comic' },
    { value: '11_header', label: 'Pixar Avatar (Cabeza)' },
    { value: '11_full', label: 'Pixar (Cuerpo entero)' },
    { value: '12_header', label: 'Pinky Avatar (Cabeza)' },
    { value: '12_full', label: 'Pinky (Cuerpo entero)' },
    { value: '13_header', label: 'Retoques (Cabeza)' },
    { value: '13_full', label: 'Retoques (Cuerpo entero)' },
];

const PhotoAvatar = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewSrc, setPreviewSrc] = useState(null);
    const [avatarSrc, setAvatarSrc] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedType, setSelectedType] = useState('10');
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setPreviewSrc(URL.createObjectURL(file));
            setAvatarSrc(null);
            setError(null);  
        } else {
            setError("Por favor selecciona un formato de imagen válido.");
        }
    };

    const handleTypeChange = (event) => {
        setSelectedType(event.target.value);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("No se ha detectado imagen.");
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`http://localhost:3001/convert-photo?cartoonType=${selectedType}`, formData, {
                responseType: 'blob'
            });

            const avatarUrl = URL.createObjectURL(response.data);
            setAvatarSrc(avatarUrl);
            setLoading(false);
        } catch (error) {
            console.error("Error subiendo foto:", error);
            setError('Error subiendo foto');
            setLoading(false);
        }
    };

    const openFileDialog = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="photo-avatar">
            <h1>Convierte tu foto en un avatar para <span className="highlight">O-CITY</span></h1>
            <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="file-input" 
                ref={fileInputRef} 
            />
            <button className="select-button" onClick={openFileDialog}>Seleccionar foto</button>
            {previewSrc && (
                <>
                    <div className="image-preview">
                        <img src={previewSrc} alt="Preview" className="preview-image" />
                    </div>
                    <select value={selectedType} onChange={handleTypeChange} className="type-select">
                        {avatarTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </>
            )}
            {error && <p className="error">{error}</p>}
            <button onClick={handleUpload} disabled={loading} className="upload-button">
                {loading ? 'Convirtiendo...' : 'Subir y convertir'}
            </button>
            {avatarSrc && (
                <div className="image-preview">
                    <img src={avatarSrc} alt="Avatar" className="preview-image" />
                </div>
            )}
        </div>
    );
};

export default PhotoAvatar;
