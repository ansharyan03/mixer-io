FROM --platform=linux/amd64 node:current-alpine

WORKDIR /app
COPY ./src ./src
# COPY ./src/** ./src/
COPY ./public ./public
COPY ./lib ./lib
COPY ./components ./components
COPY ./utils ./utils
COPY *.* .

RUN npm install
RUN npm run build

EXPOSE 80
CMD ["npm", "run", "start"]