import express from 'express'

const app = express()

app.use(express.static(new URL('../dist', import.meta.url).pathname))

app.get('/{*splat}', (_request, response) => {
  response.sendFile(new URL('../dist/index.html', import.meta.url).pathname)
})

const PORT = process.env.PORT || 3_000
app.listen(PORT, () => {
  if (process.env.NODE_ENV === 'development')
    console.info(`Server is running on port http://0.0.0.0:${PORT}`)
  else console.info(`Server is running on port ${PORT}`)
})

process.on('SIGINT', () => [
  console.info('Server is shutting down'),
  process.exit(0),
])
process.on('SIGTERM', () => [
  console.info('Server is shutting down'),
  process.exit(0),
])
process.on('uncaughtException', error => [
  console.error('Uncaught Exception:', error),
  process.exit(1),
])
process.on('unhandledRejection', (reason, promise) => [
  console.error('Unhandled Rejection at:', promise, 'reason:', reason),
  process.exit(1),
])
