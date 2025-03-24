import routes from './src/Routes/index';
import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

// ROUTES
app.use('/api', routes);
app.get('/', (req, res) => {
  res.send('Servidor rodando!');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});