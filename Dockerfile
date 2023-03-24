FROM node:17

WORKDIR /app

# Install dependencies
COPY package.json .
RUN npm install

COPY . .

ENTRYPOINT [ "npm", "start" ]
