import { supabase } from "@/lib/supabase";

import { ContactInput } from "../types/contact";


export async function createContact(
  contact: ContactInput
){

  const { data,error } =
    await supabase
      .from("contacts")
      .insert(contact);


  if(error){

    console.error(
      "Erro enviando contato:",
      error
    );

    throw error;

  }


  return data;

}