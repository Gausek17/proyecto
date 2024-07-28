import React, { useState, useRef, useEffect } from 'react';
import './AvatarGenerator.css';
import default_image_1 from '..//Assets/default1.png';
import default_image_2 from '../Assets/default2.png';
import default_image_3 from '../Assets/default3.png';
import default_image_4 from '../Assets/default.jpg';


const ImageGenerator = () => {
    const [imageUrls, setImageUrls] = useState([default_image_1, default_image_2, default_image_3, default_image_4]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedStyle, setSelectedStyle] = useState('3D Avatar');  
    const [progress, setProgress] = useState(0);  
    const inputRef = useRef(null);
    const lastRequestTime = useRef(0);

    useEffect(() => {
        if (loading) {
            setError(null);
            setProgress(0); // Reinicia el progreso cuando comienza la carga
            const interval = setInterval(() => {
                setProgress(prev => (prev < 100 ? prev + 1 : 100));
            }, 150); // Actualiza el progreso cada 150ms
            return () => clearInterval(interval); // Limpia el intervalo cuando la carga termina
        }
    }, [loading]);

    const throttle = (func, limit) => {
        return function() {
            const now = new Date().getTime();
            if (now - lastRequestTime.current >= limit) {
                func.apply(this, arguments);
                lastRequestTime.current = now;
            } else {
                setError('Por favor, espera para generar más avatares.');
            }
        }
    }

    const imageGenerator = async () => {
        const prompt = inputRef.current.value.trim();
        if (prompt === "") {
            setError("Escribe algo en el cuadro de texto");
            return;
        }
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:3001/generate-avatar",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ prompt, style: selectedStyle }),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                if (response.status === 429) {
                    setError("Has alcanzado el límite para generar avatares. Espera unos segundos.");
                } else {
                    setError(`API call failed with status: ${response.status} ${response.statusText}: ${errorText}`);
                }
                setLoading(false);
                return;
            }

            const data = await response.json();
            console.log("API Response:", data);
            if (!data || !data.data || data.data.length === 0) {
                setError("No data returned from API or data is empty");
                setLoading(false);
                return;
            }

            setImageUrls(data.data.map(img => img.url));
            setSelectedImage(null);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch');
            setLoading(false);
        }
    }

    const throttledImageGenerator = throttle(imageGenerator, 60000);  // 60 segundos de espera entre solicitudes

    const downloadImage = async () => {
        if (!selectedImage) return;

        try {
            const response = await fetch(
                "http://localhost:3001/download-avatar",
                {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ imageUrl: selectedImage }),
                }
            );

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = 'avatar.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);
        } catch (error) {
            setError('Failed to download image');
        }
    }

    return (
        <div className='ia-avatar-generator'>
            <div className='header'> Generador de Avatares personalizados para <span>O-CITY</span> </div>
            <div className='img-loading'>
                {imageUrls.every(url => url.includes('default')) && (
                    <div className='example-text'>Ejemplos de Avatares</div>
                )}
                <div className='image-grid'>
                    {imageUrls.map((url, index) => (
                        <img
                            key={index}
                            src={url}
                            alt={`Generated Avatar ${index + 1}`}
                            className={selectedImage === url ? 'selected' : ''}
                            onClick={() => setSelectedImage(url)}
                        />
                    ))}
                </div>
                {loading && (
                    <div className='loading'>
                        <div className="loading-bar" style={{ width: `${progress}%` }}></div>
                        <div className="loading-text">Cargando... {progress}%</div>
                    </div>
                )}
            </div>

            <div className="search-box">
                <input type='text' ref={inputRef} className='search-input' placeholder='Describe tu avatar personalizado.'/>
                <select className='style-select' value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)}>
                    <option value="3D Avatar">3D Avatar</option>
                    <option value="Cartoon Style">Cartoon</option>
                    <option value="Realistic">Realista</option>
                    <option value="Anime">Anime</option>
                </select>
                <div className="generate-btn" onClick={throttledImageGenerator}>Crear</div>
            </div>

            {error && (
                <div className="error-message">{error}</div>
            )}

            {selectedImage && (
                <div className="download-btn" onClick={downloadImage}>Descargar Avatar</div>
            )}
           
        </div>
    )
}

export default ImageGenerator;
