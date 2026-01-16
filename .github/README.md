# Good ol' Days

hackernews clone uing the good ol' stack:

- Webpack,
- jQuery,
- Node.js,
- Express

run locally

```sh
npm i
node --run dev
```

run in docker

```sh
docker build --tag good-ol-days .
docker run --publish 3330:3330 --rm good-ol-days
```
