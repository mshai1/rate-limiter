#Use Node LTS (recommended for production)
FROM node:24-alpine

#Set working directory
WORKDIR /app

#COPY package files first (better layer caching)
COPY package*.json ./

#Install dependencies
RUN npm install --omit=dev

#Copy application code
 COPY . .

 #Expose app port
 EXPOSE 3000

 #Start the server
 CMD [ "node", "src/server.js" ]