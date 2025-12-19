const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Register Routes
app.use('/users', require('./routes/userRoutes'));
app.use('/groups', require('./routes/groupRoutes'));
app.use('/expenses', require('./routes/expenseRoutes'));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT} (No src folder, Class-based, INR)`);
});