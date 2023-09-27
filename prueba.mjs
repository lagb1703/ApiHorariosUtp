import { UTPApi } from "./clases/UTPApi.mjs";
import dotenv from "dotenv";

dotenv.config();

let api = new UTPApi();

await api.validateUser(process.env.CEDULA, process.env.PASSWORD);

console.log(await api.getSheduleFormat())