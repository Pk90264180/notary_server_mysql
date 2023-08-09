const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const candidatesRoutes = require('./controllers/candidates');
const dotenv = require('dotenv');
dotenv.config();
app.use(express.static(__dirname));

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname }); 
});

// Routes
app.use('/api', candidatesRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
