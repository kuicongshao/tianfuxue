FROM node:22-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=frontend /app ./
EXPOSE 3000
CMD ["npm", "start"]
