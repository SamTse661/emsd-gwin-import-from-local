// require("dotenv").config();
// const express = require('express');
// const cors = require('cors');

// // const app = require("./app");
// const { logger } = require("./app/services/logger");

// const app = express();
// app.use(cors())
// app.use(express.json());

// const routes = require('./routes/routes');

// app.use('/uatImportHisToLocal', routes)

// app.listen(5000, () => {
//     console.log(`Server Started at ${5000}`)
// })

require("dotenv").config();
const app = require("./app");
const { logger } = require("./app/services/logger");

app
  .default()
  .catch((e) => (!!logger ? logger.error(e) : console.error(e)))
  .finally(app.clear);
