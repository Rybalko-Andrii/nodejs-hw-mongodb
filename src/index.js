import { initMongoConnections } from './db/initMongoDB.js';
import { setupServer } from './server.js';

const bootstrap = async () => {
  await initMongoConnections();
  setupServer();
};

bootstrap();
