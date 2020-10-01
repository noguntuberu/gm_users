FROM node:14.11-alpine
WORKDIR /app
COPY . /app
RUN npm install
EXPOSE 7200
LABEL version 1.0.0
ENTRYPOINT [ "node", "index.js" ]
