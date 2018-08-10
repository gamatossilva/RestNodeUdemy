"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//const fatorial = require('./fatorial')
const fatorial_1 = require("./fatorial");
console.log("====n-fatorial=====");
/*console.log(`Executando o script a partir do diretório ${process.cwd()}`)

process.on('exit', () => {
    console.log('script está prestes a terminar')
})*/
const argv = require('yargs').demandOption('num').argv;
const num = argv.num;
console.log(`O fatorial de ${num} é igual a ${fatorial_1.fatorial(num)}`);
