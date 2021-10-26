FROM node:latest
RUN apt update -y
WORKDIR /data/
COPY verifier.js verifier.js
RUN npm install eth-crypto ws-await
EXPOSE 8080
ENTRYPOINT ["node", "verifier.js"]
