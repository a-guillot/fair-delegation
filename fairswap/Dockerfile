FROM node:latest
WORKDIR /data/
COPY fairswap.js fairswap.js
COPY fairswap_sol_fileSale.abi fairswap_sol_fileSale.abi
COPY fairswap_sol_fileSale.bin fairswap_sol_fileSale.bin
COPY util.js util.js
RUN npm install web3-eth-contract web3
EXPOSE 8080
ENTRYPOINT ["node", "fairswap.js"]
