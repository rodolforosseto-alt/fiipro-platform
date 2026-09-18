import { supabase } from "./supabase"


export async function testConnection(){

const {data,error}= await supabase
.from("fundos")
.select("*")


console.log(data)

console.log(error)

}