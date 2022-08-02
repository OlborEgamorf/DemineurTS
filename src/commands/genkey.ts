import { generateKeyPairSync } from "crypto";
import { writeFileSync } from "fs";

const {privateKey} = generateKeyPairSync("rsa",{modulusLength:2048,privateKeyEncoding:{type:"pkcs1",format:"pem"}})

writeFileSync("privatekey.pem",privateKey)