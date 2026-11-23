import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const origin="https://wandmethod.com.br";
const cors={"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store",...cors}});
const hex=(b:Uint8Array)=>Array.from(b).map(x=>x.toString(16).padStart(2,"0")).join("");
const random=(n=32)=>hex(crypto.getRandomValues(new Uint8Array(n)));
const hash=async(s:string)=>hex(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s))));
const valid=(s:string)=>/^[0-9a-f-]{36}$/i.test(s);
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c));
const errorMessage=(x:unknown)=>x instanceof Error?x.message:String(x);
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
 if(req.method!=="POST")return json({error:"Método não permitido"},405);
 const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),resend=Deno.env.get("RESEND_API_KEY"),from=Deno.env.get("WAND_EMAIL_FROM");
 if(!url||!key)return json({error:"Serviço indisponível"},503);
 const db=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
 let input:Record<string,unknown>;
 try{input=await req.json()}catch{return json({error:"Dados inválidos"},400)}
 const action=String(input.action||"enviar");
 const id=String(input.proposta_id||"");
 if(!valid(id))return json({error:"Proposta inválida"},400);
 try{
  if(action==="enviar"){
   const auth=req.headers.get("Authorization")||"";
   if(!auth.startsWith("Bearer "))return json({error:"Sessão necessária"},401);
   const {data:{user},error}=await db.auth.getUser(auth.slice(7));
   if(error||!user)return json({error:"Sessão inválida"},401);
   const {data:profile}=await db.from("profiles").select("role").eq("id",user.id).maybeSingle();
   if(profile?.role!=="admin")return json({error:"Acesso não autorizado"},403);
   const {data:p}=await db.from("wand_propostas").select("id,aluno_id,status").eq("id",id).maybeSingle();
   if(!p||p.status!=="enviada")return json({error:"Proposta indisponível"},404);
   const {data:aluno}=await db.from("alunos").select("nome_completo,email").eq("id",p.aluno_id).maybeSingle();
   const email=String(aluno?.email||"").trim().toLowerCase();
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:"Interessado sem e-mail válido"},422);
   if(!resend||!from)return json({error:"Envio por e-mail não configurado"},503);
   const token=random(),tokenHash=await hash(token);
   const {error:saveError}=await db.from("wand_contrato_verificacoes").upsert({proposta_id:id,email_destino:email,acesso_hash:tokenHash,acesso_expira_em:new Date(Date.now()+7*86400000).toISOString(),acesso_utilizado_em:null,codigo_hash:null,codigo_expira_em:null,codigo_tentativas:0,codigo_enviado_em:null,atualizado_em:new Date().toISOString()},{onConflict:"proposta_id"});
   if(saveError){console.error("Erro ao registrar link",saveError.message);return json({error:"Não foi possível preparar o acesso seguro"},500)}
   const link=origin+"/contrato-aceite.html?proposta="+encodeURIComponent(id)+"&chave="+token;
   const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+resend,"Content-Type":"application/json"},body:JSON.stringify({from,to:[email],subject:"Seu contrato WAND METHOD — confirmação segura",html:'<div style="font-family:Arial,sans-serif;background:#101010;color:#f5e9cf;padding:28px"><h2 style="color:#d8ad52">WAND METHOD</h2><p>Olá, '+esc(String(aluno?.nome_completo||""))+'.</p><p>Sua proposta está pronta. Abra o link e confirme o código enviado ao seu e-mail para visualizar e decidir.</p><p><a style="color:#e4bb65" href="'+link+'">Acessar meu contrato</a></p><p>O link expira em 7 dias. Não compartilhe.</p></div>'})});
   if(!response.ok){console.error("Resend falhou",response.status,await response.text());return json({error:"Provedor de e-mail recusou o envio"},502)}
   const {error:marked}=await db.from("wand_propostas").update({email_enviado_em:new Date().toISOString()}).eq("id",id);
   if(marked){console.error("E-mail entregue ao provedor, mas falhou registro do envio",marked.message);return json({error:"E-mail encaminhado, mas o histórico não foi atualizado. Verifique antes de reenviar."},500)}
   return json({ok:true,message:"E-mail enviado"});
  }
  const token=String(input.chave||"");
  if(!/^[a-f0-9]{64}$/.test(token))return json({error:"Link inválido ou incompleto"},400);
  const {data:v,error:ve}=await db.from("wand_contrato_verificacoes").select("*").eq("proposta_id",id).maybeSingle();
  if(ve||!v||v.acesso_hash!==await hash(token)||!v.acesso_expira_em||new Date(v.acesso_expira_em).getTime()<Date.now()||v.acesso_utilizado_em)return json({error:"Link inválido ou expirado. Solicite um novo envio."},403);
  const {data:p}=await db.from("wand_propostas").select("id,status,modalidade,plano,mensalidade,total,documento_texto,documento_sha256,versao_contrato").eq("id",id).maybeSingle();
  if(!p||p.status!=="enviada")return json({error:"Proposta não disponível para decisão"},409);
  if(action==="solicitar_codigo"){
   if(!resend||!from)return json({error:"Serviço de e-mail indisponível"},503);
   if(v.codigo_enviado_em&&Date.now()-new Date(v.codigo_enviado_em).getTime()<60000)return json({error:"Aguarde 1 minuto antes de pedir outro código"},429);
   const code=String(crypto.getRandomValues(new Uint32Array(1))[0]%1000000).padStart(6,"0");
   const now=new Date();
   const {error:ue}=await db.from("wand_contrato_verificacoes").update({codigo_hash:await hash(token+":"+code),codigo_expira_em:new Date(Date.now()+10*60000).toISOString(),codigo_tentativas:0,codigo_enviado_em:now.toISOString(),atualizado_em:now.toISOString()}).eq("proposta_id",id).eq("acesso_hash",v.acesso_hash);
   if(ue)return json({error:"Não foi possível gerar o código"},500);
   const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+resend,"Content-Type":"application/json"},body:JSON.stringify({from,to:[v.email_destino],subject:"Código de confirmação — WAND METHOD",html:'<div style="font-family:Arial,sans-serif;background:#101010;color:#f5e9cf;padding:28px"><h2 style="color:#d8ad52">WAND METHOD</h2><p>Seu código para consultar o contrato é:</p><p style="font-size:32px;letter-spacing:6px"><b>'+code+'</b></p><p>Válido por 10 minutos. Não compartilhe.</p></div>'})});
   if(!response.ok){console.error("Falha no código",response.status);return json({error:"Não foi possível enviar o código"},502)}
   return json({ok:true,message:"Código enviado ao e-mail cadastrado"});
  }
  const code=String(input.codigo||"");
  if(!/^\d{6}$/.test(code))return json({error:"Informe o código de 6 dígitos"},400);
  if(!v.codigo_hash||!v.codigo_expira_em||Date.now()>new Date(v.codigo_expira_em).getTime())return json({error:"Código expirado. Solicite outro."},403);
  if(v.codigo_tentativas>=5)return json({error:"Limite de tentativas. Solicite outro código."},429);
  const {error:attemptError}=await db.from("wand_contrato_verificacoes").update({codigo_tentativas:v.codigo_tentativas+1}).eq("proposta_id",id).eq("codigo_tentativas",v.codigo_tentativas);
  if(attemptError)return json({error:"Não foi possível validar o código"},500);
  if(v.codigo_hash!==await hash(token+":"+code))return json({error:"Código incorreto"},403);
  if(action==="consultar")return json({ok:true,proposta:p});
  if(action==="decidir"){
   const aceitar=input.aceitar===true;
   if(input.aceitar!==true&&input.aceitar!==false)return json({error:"Decisão inválida"},400);
   if(aceitar&&input.consentimento!==true)return json({error:"Confirme a leitura e concordância com o contrato"},400);
   const {error:insertError}=await db.from("wand_aceites_email").insert({proposta_id:id,email_confirmado:v.email_destino,decisao:aceitar?"aceito":"recusado",versao_contrato:p.versao_contrato,documento_sha256:p.documento_sha256,agente_usuario:(req.headers.get("user-agent")||"").slice(0,500)});
   if(insertError)return json({error:"Esta proposta já teve uma decisão registrada ou houve falha no registro"},409);
   const {error:updateError}=await db.from("wand_propostas").update({status:aceitar?"aceita":"recusada",decidida_em:new Date().toISOString()}).eq("id",id).eq("status","enviada");
   if(updateError){console.error("Erro no status",updateError.message);return json({error:"Decisão registrada; contate o treinador para confirmar o status"},500)}
   await db.from("wand_contrato_verificacoes").update({acesso_utilizado_em:new Date().toISOString(),codigo_hash:null}).eq("proposta_id",id);
   return json({ok:true,message:aceitar?"Contrato aceito e registrado":"Proposta recusada e registrada"});
  }
  return json({error:"Operação inválida"},400);
 }catch(e){console.error("Falha no fluxo de contratos",errorMessage(e));return json({error:"Erro ao processar a solicitação"},500)}
});
