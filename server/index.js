import { exec } from 'child_process';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_DIR = path.join(__dirname, 'storage');
const VIDEO_DIR = path.join(__dirname, 'videos');
const DATA_FILE = path.join(STORAGE_DIR, 'videosData.json');

try {
  if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR);
  if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR);
} catch (err) {
  console.error('Ошибка при создании каталогов:', err);
}

try {
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({}));
} catch (err) {
  console.error('Ошибка при инициализации файла данных:', err);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});
const PORT = 3000;

app.use(cors());
app.use('/videos', express.static(VIDEO_DIR));

let activeUsers = 0;

io.on('connection', (socket) => {
  activeUsers++;
  io.emit('userCount', activeUsers);

  socket.on('disconnect', () => {
    activeUsers--;
    io.emit('userCount', activeUsers);
  });
});

app.get('/download', async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).send('Требуется указать URL-адрес видео');
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(DATA_FILE));
  } catch (err) {
    console.error('Ошибка при чтении файла данных:', err);
    return res.status(500).send('Internal server error');
  }

  const existingEntry = Object.values(data).find((entry) => entry.url === videoUrl);

  if (existingEntry) {
    return res.status(200).send({ videoId: existingEntry.id });
  }

  const videoId = Date.now();
  const videoPath = path.join(VIDEO_DIR, `${videoId}.mp4`);

  console.log(`Получен запрос на загрузку видео с URL: ${videoUrl}`);

  try {
    const command = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4" --output "${videoPath}" ${videoUrl}`;
    
    const downloadProcess = exec(command);

    downloadProcess.stdout.on('data', (data) => {
      const match = data.match(/\[download\]\s+(\d+\.\d+)%\s+of\s+~?(\d+\.\d+)(\w+)\s+at\s+(\d+\.\d+)(\w+)\/s/i);
      if (match) {
        const progress = parseFloat(match[1]);
        const totalSize = parseFloat(match[2]);
        const totalBytes = totalSize * (match[3] === 'MiB' ? 1024 * 1024 : 1024);
        const speed = parseFloat(match[4]);
        const downloadedBytes = (progress / 100) * totalBytes;

        io.emit('download-progress', {
          progress,
          downloadedBytes,
          totalBytes,
          speed: speed * (match[5] === 'MiB' ? 1024 : 1) // Convert speed to KB/s
        });
      }
    });

    downloadProcess.on('exit', (code) => {
      if (code === 0) {
        const newEntry = { id: videoId, url: videoUrl, path: videoPath };
        data[videoId] = newEntry;
        try {
          fs.writeFileSync(DATA_FILE, JSON.stringify(data));
        } catch (err) {
          console.error('Ошибка при записи файла данных:', err);
          return res.status(500).send('Failed to update video data');
        }
        console.log(`Видео с URL ${videoUrl} было загружено в ${videoPath}`);
        res.status(200).send({ videoId });
      } else {
        res.status(500).send('Failed to download video');
      }
    });
  } catch (error) {
    console.error(`Ошибка при обработке запроса: ${error.message}`);
    res.status(500).send('Failed to process video');
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
