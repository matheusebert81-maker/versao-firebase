import express from 'express';
import next from 'next';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: './frontend' });
const handle = app.getRequestHandler();

const PORT = 3000;

app.prepare().then(() => {
  const server = express();

  server.use(helmet({
    contentSecurityPolicy: false,
  }));
  server.use(cors());
  server.use(morgan('dev'));
  server.use(express.json());

  // API Routes
  server.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Next.js request handling
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
