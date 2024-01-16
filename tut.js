const http= require('http')
const fs =require('fs')
const fileContent= fs.readFileSync('test.html')

const server= https.createServer((req,res))