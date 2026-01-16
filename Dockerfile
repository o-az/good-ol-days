# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm clean-install

COPY src/ src/
COPY tsconfig.json webpack.config.ts ./

RUN npm run build


# Production stage
FROM node:24-alpine AS production

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm clean-install --omit=dev \
  && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY src/server.ts ./dist/

RUN addgroup -g 1001 -S app && adduser -S app -u 1001 -G app
USER app

ENV NODE_ENV=production
ENV PORT=3330

EXPOSE 3330

CMD ["node", "dist/server.ts"]
