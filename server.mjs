import express from 'express';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const app = express();
const port = process.env.PORT || 4000;
const browserDistFolder = resolve('dist/app-mu-inmortal/browser');

if (existsSync(browserDistFolder)) {
  app.use(
    express.static(browserDistFolder, {
      maxAge: '1y',
      index: false,
      redirect: false,
    }),
  );

  app.use((_req, res) => {
    res.sendFile(join(browserDistFolder, 'index.html'));
  });
} else {
  console.warn(
    `No se encontro la carpeta de build: ${browserDistFolder}. Ejecuta "npm run build" primero.`,
  );
}

app.listen(port, (error) => {
  if (error) {
    throw error;
  }

  console.log(`AllStar server listening on http://localhost:${port}`);
});
