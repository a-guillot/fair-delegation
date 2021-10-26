cd contracts && ls *sol | xargs -n 1 -P 5 -t ../node_modules/.bin/solcjs --bin --abi && cd ..
