FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate
RUN npm run build

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]