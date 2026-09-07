const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log(`🚀 Express API listening on http://localhost:${env.port}`);
  console.log(`   FastAPI AI service target: ${env.fastapiUrl}`);
});
