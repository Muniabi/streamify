import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import http from 'http';
import { exec } from 'child_process'; // Для использования yt-dlp

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Обновленные пути
const STORAGE_DIR = path.join(__dirname, 'storage');
const VIDEO_DIR = path.join(__dirname, 'videos');
const DATA_FILE = path.join(STORAGE_DIR, 'videosData.json');

// Создание директорий, если они не существуют
try {
  if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR);
  if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR);
} catch (err) {
  console.error('Ошибка при создании каталогов:', err);
}

// Инициализация файла данных, если его нет
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
    // Используем yt-dlp для загрузки видео и сохранения его как .mp4
    const command = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4" -o "${videoPath}" ${videoUrl}`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Ошибка при загрузке видео: ${stderr}`);
        return res.status(500).send('Failed to download video');
      }

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
    });
  } catch (error) {
    console.error(`Ошибка при обработке запроса: ${error.message}`);
    res.status(500).send('Failed to process video');
  }
});

app.get('/stream/:videoId', (req, res) => {
  const { videoId } = req.params;
  let data;

  try {
    data = JSON.parse(fs.readFileSync(DATA_FILE));
  } catch (err) {
    console.error('Ошибка при чтении файла данных:', err);
    return res.status(500).send('Internal Server Error');
  }

  const videoEntry = data[videoId];

  if (!videoEntry || !fs.existsSync(videoEntry.path)) {
    console.error(`Видео не найдено: ${videoId}`);
    return res.status(404).send('Video not found');
  }

  const videoPath = videoEntry.path;
  const range = req.headers.range;

  if (range) {
    const videoSize = fs.statSync(videoPath).size;
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = Math.min(start + 1024 * 1024 - 1, videoSize - 1);

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': 'video/mp4'
    });

    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);

    videoStream.on('error', (error) => {
      console.error(`Ошибка при потоковой передаче видео: ${error.message}`);
      res.status(500).send('Failed to stream video');
    });
  } else {
    res.setHeader('Content-Type', 'video/mp4');
    const videoStream = fs.createReadStream(videoPath);
    videoStream.pipe(res);

    videoStream.on('error', (error) => {
      console.error(`Ошибка при потоковой передаче видео: ${error.message}`);
      res.status(500).send('Failed to stream video');
    });
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
