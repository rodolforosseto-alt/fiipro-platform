import { supabase } from "@/lib/supabase";

import { FeedbackInput } from "../types/feedback";


export async function createFeedback(
  feedback:FeedbackInput
){


const { data,error } =
await supabase
.from("feedbacks")
.insert(feedback);



if(error){

console.error(
"Erro enviando feedback:",
error
);

throw error;

}


return data;

}