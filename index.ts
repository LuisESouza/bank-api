import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// ROUTES
app.use('/api' /* ROTA INDEX */);
app.get('/', (req, res) => {
  res.send('Servidor rodando!');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});