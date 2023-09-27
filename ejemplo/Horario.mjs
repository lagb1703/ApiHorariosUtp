//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Deshabilitar la verificación de certificados (no recomendado para producción)
import {parse} from 'node-html-parser';
import fetch from 'node-fetch';
import { Agent } from 'https';
import dotenv from 'dotenv';

dotenv.config();

let ID;

const keepAliveAgent = new Agent({ keepAlive: true });


const PHPSESSID = (cookies)=>{
  return cookies[1];
}

fetch('https://app4.utp.edu.co/pe/', {
  method: 'GET',
  agent: keepAliveAgent,
}).then(result=>{
  ID = PHPSESSID(result.headers.raw()['set-cookie']);
  return result.text()
}).then(text=>{
  let html = parse(text);
  let input = html.querySelector('input[type="hidden"]');
  let {name, value} = input.attributes;
  let data = `${name}=${value}&txtUrio=1089378706&txtPsswd=Mementomori1987&cocat=0}`
  fetch('https://app4.utp.edu.co/pe/validacion.php', {
    method: 'POST',
    headers: {
      "accept": "application/json, text/javascript, */*; q=0.01",
      "accept-language": "es-ES,es;q=0.9",
      "content-type": "application/x-www-form-urlencoded",
      "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
      'Cookie': ID.split(";")[0],
      "Referer": "https://app4.utp.edu.co/pe/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    body: data
  }).then(result=>{
    if (!result.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return result.json();
  }).then(json=>{
    fetch("https://app4.utp.edu.co/pe/utp.php", {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "es-ES,es;q=0.9",
        "cache-control": "max-age=0",
        "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": ID.split(";")[0],
        "Referer": "https://app4.utp.edu.co/pe/index.php",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": null,
      "method": "HEAD"
    }).then(r=>{
      if(!r.ok){
        throw new Error("falla");
      }
      return r.text();
    }).then(text => {
      fetch("https://app4.utp.edu.co/MatAcad/verificacion/horario.php", {
        "headers": {
          "accept": "*/*",
          "accept-language": "es-ES,es;q=0.9",
          "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
          "cookie": ID.split(";")[0],
          "Referer": "https://app4.utp.edu.co/pe/utp.php",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "POST"
      }).then(res =>res.text())
      .then(text => console.log(text));
    })
  })
}).catch(e=>{
  console.log(e)
})
