import dotenv from 'dotenv';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

const apiKey = process.env.CUTOUT_PRO_API_KEY;
const imagePath = './test-image.jpg'; // Ruta a una imagen de prueba

if (!apiKey) {
    console.error("Cutout.Pro API key is missing");
    process.exit(1);
}

const testApiCall = async () => {
    try {
        const buffer = fs.readFileSync(imagePath);

        const formData = new FormData();
        formData.append('file', buffer, 'image.jpg');

        const response = await axios.post('https://www.cutout.pro/api/v1/cartoon-selfie', formData, {
            headers: {
                'APIKEY': apiKey,
                ...formData.getHeaders()
            }
        });

        if (response.status !== 200) {
            console.error(`Cutout.Pro API response error: ${response.status} ${response.statusText}`);
            console.error(`Response data: ${JSON.stringify(response.data)}`);
            return;
        }

        const avatarUrl = response.data.data.url; // Según la documentación de Cutout.Pro
        console.log('Avatar URL:', avatarUrl);
    } catch (error) {
        console.error("Error processing photo:", error);
        if (error.response) {
            console.error(`Error response data: ${JSON.stringify(error.response.data)}`);
        } else {
            console.error(error.message);
        }
    }
};

testApiCall();
