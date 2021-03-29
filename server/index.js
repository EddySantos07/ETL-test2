const express = require('express');
const app = express();
const port = 3000;

const { router } = require('./Routers/Routers');
const { t } = require('./Routers/token');

app.get('/loaderio-07ff36c26ccd9ffc086268455547f317.txt', t)

app.use('/qa', router)

app.get('/', (req, res) => {
  res.send('Hello World!')
})



app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
})

module.exports.app = app;