import {parse} from 'node-html-parser';
import fetch from 'node-fetch';
import { Agent } from 'https';
import { promises } from 'dns';

class UTPApi{
    /*
    * aca se guardara la cookie PHPSESSID que es la unica cookie que se necesita para
    * iniciar sesion y mantenerla
    */
    cookieId = "";

    /*
    * aca se guardara el id que tendra el input del form que da la utp
    */
    formId = "";

    /*
    * aca se guarrdara el objeto para hacer la coneccion mas rapida
    */
    keepAliveAgent = null;

    /*
    * guarda el usuario actual que usa la informacion
    */
    curentUser = "";

    /*
    * indica si se hizo la coneccion a utp.php
    */
    utpPHP = false;


    constructor(){
        this.keepAliveAgent = new Agent({ keepAlive: true });
        this.intentosConexion = 5;
    }

    /**
     * @name validateUser
     * @description Verifica el usuario y contraseña y crea la instancia del PHPSESSID y del input ID
     * para el usuario
     */
    navigateIntoUtpPHP(){
        if(this.cookieId == ""){
            throw new Error("se necesita la cookie para funcionar");
        }
        if(this.curentUser == ""){
            throw new Error("se requiere un usuario para funcionar");
        }
        return fetch("https://app4.utp.edu.co/pe/utp.php", {
            "headers": {
                "cookie": this.cookieId
            },
            "body": null,
            "method": "HEAD"
        }).then(r=>{
            this.utpPHP = r.ok;
            return r.ok;
        })
    }

    async getSheduleFormat(){
        let html = parse(await this.getShedule());
        html.querySelectorAll("fieldset.form1line").map((t)=>{
            console.log(t.text)
        });
    }

    /**
     * @name getShedule
     * @description obtiene el html donde esta contenido la descripcion del horario
     */
    async getShedule(){
        if(!this.utpPHP){
            await api.navigateIntoUtpPHP();
        }
        if(this.cookieId == ""){
            throw new Error("se necesita la cookie para funcionar");
        }
        return fetch("https://app4.utp.edu.co/MatAcad/verificacion/horario.php", {
            "headers": {
              "cookie": this.cookieId
            },
            "body": null,
            "method": "POST"
        }).then(result=>{
            if (!result.ok) {
                throw new Error(`error http: ${response.status}`);
            }
            return result.text();
        }).then(text=>{
            return text;
        });
    }

    /**
     * @name validateUser
     * @param {string} usuario usuario registrado en la base de datos de la UTP
     * @param {string} contraseña contraseña de ese usuario de la base de datos de la utp
     * @description Verifica el usuario y contraseña y crea la instancia del PHPSESSID y del input ID
     * para el usuario
     */
    async validateUser(usuario, contraseña){
        if(this.cookieId == "" || this.formId == ""){
            await this.getUtpInfo();
        }
        let data = `${this.formId}&txtUrio=${usuario}&txtPsswd=${contraseña}&cocat=0}`
        return fetch('https://app4.utp.edu.co/pe/validacion.php', {
            method: 'POST',
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                'Cookie': this.cookieId
            },
            body: data
        }).then(result=>{
            if (!result.ok) {
                throw new Error(`error http: ${response.status}`);
            }
            return result.json();
        }).then(json=>{
            this.curentUser = usuario;
            return json[0] == "RD";
        })
    }

    /**
     * @name getUtpInfo
     * @description Obtiene el cookieId y el formId directamente de la pagina https://app4.utp.edu.co/pe/
     */
    getUtpInfo(){
        return fetch('https://app4.utp.edu.co/pe/', {
            method: 'GET',
            agent: this.keepAliveAgent,
        }).then(result=>{
            if (!result.ok) {
                throw new Error(`error http: ${response.status}`);
            }
            this.cookieId = result.headers.raw()['set-cookie'][1].split(";")[0];
            return result.text()
        }).then(text=>{
                let html = parse(text);
                let input = html.querySelector('input[type="hidden"]');
                let {name, value} = input.attributes;
                this.formId = `${name}=${value}`
                return{
                    PHPSESSID:this.cookieId,
                    INPUTATTR:this.formId
                };
        });
    }
}

let api = new UTPApi();

await api.validateUser("1004685950", "Pepeelmago123");

console.log(await api.getShedule());