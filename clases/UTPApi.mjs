import {parse} from 'node-html-parser';
import fetch from 'node-fetch';
import { Agent } from 'https';

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
        if(this.curentUser == ""){
            throw new Error("Necesitas validar un usuario para continuar");
        }
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

    /**
     * @name getSheduleFormat
     * @description crea un array con el horario siguiendo el siguiente formato
     * [
     *   {
     *    nombre:str
     *    codigo:string
     *    grupo: number
     *    fecha: [
     *        {
     *            dia:string
     *            inicio:string
     *            final:string
     *            salon:string
     *        },
     *        ...
     *  ]
     *  },
     * ...
     * ]
     */
    async getSheduleFormat(){
        let html = parse(await this.getShedule());
        let elementos = html.querySelectorAll("fieldset.form1line")[2].text.split("\n");
        elementos.shift();
        elementos.shift();
        let data = []
        for(let i = 0; i < elementos.length; i += 2){
            let top = "";
            if(elementos[i][0] == ' '){
                top = elementos[i].substring(2, elementos[i].length);
            }else{
                top = elementos[i];
            }
            let info = {
                nombre:"",
                codigo:"",
                grupo:0,
                fecha:null
            }
            info.codigo = top.substring(0, 5);
            info.grupo = parseInt(top.substring(top.length - 1, top.length));
            info.nombre = top.substring(5, top.length - 6).replace(" ", "");
            if(i+1 >= elementos.length)
                break;
            info.fecha = elementos[i+1]
            .substring(0, elementos[i+1].length - 3)
            .split(",").map((horario)=>{
                if(horario[0] == ' '){
                    horario = horario.substring(1, horario.length);
                }
                let separado = horario.split(" ");
                let fecha = {
                    dia:"",
                    inicio:"",
                    final:"",
                    salon:""
                };
                fecha.dia = separado[1];
                fecha.inicio = separado[3];
                fecha.final = separado[5];
                fecha.salon = separado[0];
                return fecha;
            });
            data.push(info);
        }
        return data;
    }

    /**
     * @name getShedule
     * @description obtiene el html donde esta contenido la descripcion del horario
     */
    async getShedule(){
        if(!this.utpPHP){
            await this.navigateIntoUtpPHP();
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
        if(this.curentUser != ""){
            throw new Error("No puedes validar sin terminar la session del otro usuario, te recomiendo usar api.endSessionUser()");
        }
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

    /**
     * @name endSessionUser
     * @description Termina con la session del usuario
     */
    endSessionUser(){
        this.cookieId = "";
        this.curentUser = "";
        this.formId = "";
        this.utpPHP = false;
        return;
    }
}
export { UTPApi };