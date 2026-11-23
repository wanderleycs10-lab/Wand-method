// Supabase Edge Function: wand-enviar-contrato
// Configure RESEND_API_KEY and WAND_EMAIL_FROM (verified domain) in Supabase secrets.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
Deno.serve(async req=>{
 if(req.method!=="POST")return json({error:"Método não permitido"},405);
 const auth=req.headers.get("Authorization")||"";
 if(!auth.startsWith("Bearer "))return json({error:"Sessão necessária"},401);
 const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),resend=Deno.env.get("RESEND_API_KEY"),from=Deno.env.get("WAND_EMAIL_FROM");
 if(!url||!key)return json({error:"Serviço indisponível"},503);
 const db=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
 const {data:{user},error:authError}=await db.auth.getUser(auth.slice(7));
 if(authError||!user)return json({error:"Sessão inválida"},401);
 const {data:profile}=await db.from("profiles").select("role").eq("id",user.id).maybeSingle();
 if(profile?.role!=="admin")return json({error:"Acesso não autorizado"},403);
 let id:string;
 try{id=String((await req.json()).proposta_id||"")}catch{return json({error:"Dados inválidos"},400)}
 if(!/^[0-9a-f-]{36}$/i.test(id))return json({error:"Proposta inválida"},400);
 const {data:p,error:pe}=await db.from("wand_propostas").select("id,aluno_id,status").eq("id",id).maybeSingle();
 if(pe||!p||p.status!=="enviada")return json({error:"Proposta indisponível"},404);
 const {data:aluno,error:ae}=await db.from("alunos").select("nome_completo,email,user_id").eq("id",p.aluno_id).maybeSingle();
 if(ae||!aluno?.email||!aluno.user_id)return json({error:"Aluno sem e-mail ou conta vinculada"},422);
 const email=String(aluno.email).trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:"E-mail do aluno inválido"},422);
 const {data:linked,error:le}=await db.auth.admin.getUserById(aluno.user_id);
 if(le||!linked.user||linked.user.email?.toLowerCase()!==email)return json({error:"O e-mail cadastrado não corresponde à conta do aluno"},422);
 if(!resend||!from)return json({error:"Envio por e-mail ainda não configurado"},503);
 const link="https://wandmethod.com.br/contratos-aluno.html?proposta="+encodeURIComponent(p.id);
 const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c));
 const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+resend,"Content-Type":"application/json"},body:JSON.stringify({from,to:[email],subject:"Seu contrato WAND METHOD está disponível",html:'<div style="font-family:Arial,sans-serif;background:#101010;color:#f5e9cf;padding:28px"><h2 style="color:#d8ad52">WAND METHOD</h2><p>Olá, '+esc(aluno.nome_completo||"")+'.</p><p>Seu contrato está disponível para leitura e aceite na área segura do aplicativo.</p><p><a style="color:#e4bb65" href="'+link+'">Acessar meu contrato</a></p><p>Entre com sua conta WAND METHOD para consultar a proposta. Não compartilhe este e-mail.</p></div>'})});
 if(!response.ok){console.error("Erro no provedor de e-mail",response.status);return json({error:"Não foi possível enviar o e-mail. Tente novamente."},502)}
 return json({ok:true,message:"E-mail enviado com sucesso!"});
});
