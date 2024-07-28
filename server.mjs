import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import path from 'path';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, 'src/backend/.env') });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY}`);
console.log(`CUTOUT_PRO_API_KEY: ${process.env.CUTOUT_PRO_API_KEY}`);

app.post('/generate-avatar', async (req, res) => {
    const { prompt, style } = req.body;

    if (!prompt) {
        return res.status(400).send("Prompt is required");
    }

    const sanitizedPrompt = prompt.replace(/[^a-zA-Z0-9 ]/g, ''); 
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error("OpenAI API key is missing");
        return res.status(500).send("Server configuration error: API key is missing");
    }

    console.log(`Generating avatar with prompt: "${sanitizedPrompt}" and style: "${style}"`);

    try {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                prompt: `${style} avatar of ${sanitizedPrompt}`,
                n: 4,
                size: "512x512",
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`OpenAI API response error: ${response.status} ${response.statusText}: ${errorText}`);
            return res.status(response.status).send(errorText);
        }

        const data = await response.json();
        console.log("Generated avatars:", data);
        return res.json(data);
    } catch (error) {
        console.error("Error mientras se generaba el avatar:", error);
        return res.status(500).send(error.message);
    }
});

app.post('/convert-photo', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send("No hay imagen seleccionada");
    }

    const cartoonType = req.query.cartoonType || '10'; 
    const apiKey = process.env.CUTOUT_PRO_API_KEY;
    const buffer = req.file.buffer;

    if (!apiKey) {
        console.error("Cutout.Pro API key is missing");
        return res.status(500).send("Server configuration error: API key is missing");
    }

    console.log(`API Key: ${apiKey}`);
    console.log("Converting photo with Cutout.Pro API");

    try {
        const formData = new FormData();
        formData.append('file', buffer, 'image.jpg');

        console.log('FormData headers:', formData.getHeaders());

        const response = await axios.post(`https://www.cutout.pro/api/v1/cartoonSelfie?cartoonType=${cartoonType}`, formData, {
            responseType: 'arraybuffer',
            headers: {
                'APIKEY': apiKey,
                ...formData.getHeaders()
            }
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (response.status !== 200) {
            console.error(`Cutout.Pro API response error: ${response.status} ${response.statusText}`);
            console.error(`Response data: ${Buffer.from(response.data).toString('utf-8')}`);
            return res.status(response.status).send(Buffer.from(response.data).toString('utf-8'));
        }

        console.log('Cutout.Pro response received');

        res.set('Content-Type', 'image/png');
        res.send(Buffer.from(response.data, 'binary'));
    } catch (error) {
        console.error("Error processing photo:", error);
        if (error.response) {
            console.error(`Error response data: ${Buffer.from(error.response.data).toString('utf-8')}`);
            res.status(error.response.status).send(Buffer.from(error.response.data).toString('utf-8'));
        } else {
            res.status(500).send(error.message);
        }
    }
});

app.post('/download-avatar', async (req, res) => {
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).send("Imagen URL es requerida");
    }

    try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch image');
        }
        const buffer = await response.buffer();

        const processedImage = await sharp(buffer)
            .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .toBuffer();

        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Disposition': 'attachment; filename=avatar.png',
            'Content-Length': processedImage.length
        });
        return res.end(processedImage);
    } catch (error) {
        console.error("Error descargando el avatar:", error);
        res.status(500).send(error.message);
    }
});

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
