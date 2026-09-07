# Build context is the MONOREPO ROOT (see docker-compose.yml) so this
# Dockerfile can also pull in the shared database/schema.sql.
FROM node:20-alpine

WORKDIR /app

COPY backend-express/package*.json ./
RUN npm install --omit=dev

COPY backend-express/ .
COPY database /database

RUN mkdir -p src/uploads/resumes src/uploads/certificates src/uploads/documents

EXPOSE 5000

# Migration is idempotent (CREATE TABLE IF NOT EXISTS), safe to run on every boot.
# Seeding is NOT run automatically — it truncates tables — run it once manually:
#   docker compose exec backend-express npm run seed
CMD ["sh", "-c", "npm run migrate && npm start"]
