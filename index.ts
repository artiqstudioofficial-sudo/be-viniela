import express, { Request, Response } from 'express';

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

import cors, { CorsOptions } from 'cors';

const corsOptions: CorsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

/* -------------------------------------------------------------------------- */
/*                               STATIC UPLOADS                               */
/* -------------------------------------------------------------------------- */

app.use('/uploads', express.static(UPLOAD_ROOT));

/* -------------------------------------------------------------------------- */
/*                                 MIDDLEWARE                                 */
/* -------------------------------------------------------------------------- */

app.use(
  express.json({
    limit: '20mb',
  }),
);
app.use(
  express.urlencoded({
    extended: true,
    limit: '20mb',
  }),
);

/* -------------------------------------------------------------------------- */
/*                                   ROUTES                                   */
/* -------------------------------------------------------------------------- */

// routes upload media (mounted di /api/news)
app.use('/api/news', uploadRoutes);

// routes news CRUD
app.use('/api/news', newsRoutes);

// routes careers CRUD
app.use('/api/careers', careersRoutes);

// routes team CRUD
app.use('/api/team', teamRoutes);

// routes partners CRUD
app.use('/api/partners', partnerRoutes);

// routes contact messages
app.use('/api/contact-messages', contactRoutes);

/**
 * GET /api/db-test
 * Cek koneksi DB
 */
app.get('/api/db-test', async (_: Request, res: Response) => {
  try {
    const tables = await query<any>('SHOW TABLES');
    res.json({ ok: true, tables });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
