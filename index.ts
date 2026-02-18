import express, { Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';

import { UPLOAD_ROOT } from './config/upload';
import { query } from './lib/db';
import careersRoutes from './routes/careersRoutes';
import newsRoutes from './routes/newsRoutes';
import partnerRoutes from './routes/partnerRoutes';
import teamRoutes from './routes/teamRoutes';
import uploadRoutes from './routes/uploadRoutes';
import contactRoutes from './routes/contactRoutes';

const app = express();
const PORT = 4111;

/**
 * Kalau kamu pakai cookie / Authorization Bearer dari browser:
 * - kalau pakai cookie (credentials): origin TIDAK boleh "*"
 * - kalau cuma Bearer token: boleh "*"
 */
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://viniela.id',
  // tambah domain FE produksi kamu di sini
  // "https://your-frontend.com",
];

const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    // allow non-browser tools (Postman/curl) yang origin-nya undefined
    if (!origin) return cb(null, true);

    // pilih salah satu:
    // 1) allow semua:
    // return cb(null, true);

    // 2) allow list:
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin'],
  exposedHeaders: ['Content-Length'], // optional
  credentials: false, // true kalau kamu pakai cookie/sessions dari FE
  optionsSuccessStatus: 204,
  maxAge: 86400, // cache preflight 1 hari
};

// ✅ CORS harus di paling atas
app.use(cors(corsOptions));
// ✅ Handle preflight untuk semua route
app.options('*', cors(corsOptions));

/* -------------------------------------------------------------------------- */
/*                               STATIC UPLOADS                               */
/* -------------------------------------------------------------------------- */
app.use('/uploads', express.static(UPLOAD_ROOT));

/* -------------------------------------------------------------------------- */
/*                                 MIDDLEWARE                                 */
/* -------------------------------------------------------------------------- */
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

/* -------------------------------------------------------------------------- */
/*                                   ROUTES                                   */
/* -------------------------------------------------------------------------- */
app.use('/api/news', uploadRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/contact-messages', contactRoutes);

app.get('/api/db-test', async (_: Request, res: Response) => {
  try {
    const tables = await query<any>('SHOW TABLES');
    res.json({ ok: true, tables });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// error handler (biar error CORS kebaca)
app.use((err: any, _req: Request, res: Response, _next: any) => {
  if (err?.message?.includes('CORS')) {
    return res.status(403).json({ ok: false, message: err.message });
  }
  return res.status(500).json({ ok: false, message: err?.message || 'Error' });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
