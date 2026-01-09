import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Express server');
});

app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
});