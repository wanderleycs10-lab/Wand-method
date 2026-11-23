import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const origin="https://wandmethod.com.br";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store",...cors}});
const hex=(b:Uint8Array)=>Array.from(b).map(x=>x.toString(16).padStart(2,"0")).join("");
const random=(n=32)=>hex(crypto.getRandomValues(new Uint8Array(n)));
const hash=async(s:string)=>hex(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s))));
const valid=(s:string)=>/^[0-9a-f-]{36}$/i.test(s);
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c));
const errorMessage=(x:unknown)=>x instanceof Error?x.message:String(x);
async function prepararConvite(db:ReturnType<typeof createClient>,alunoId:number,propostaId:string,email:string,nome:string,canal:"email"|"whatsapp",resend:string|undefined,from:string|undefined){
 const destino="https://wandmethod.com.br/criar-senha.html";
 const {data:aluno,error:alunoErro}=await db.from("alunos").select("id,user_id,email").eq("id",alunoId).maybeSingle();
 if(alunoErro||!aluno||String(aluno.email||"").trim().toLowerCase()!==email)return {error:"E-mail do cadastro não corresponde ao contrato",status:409};
 const existente=Boolean(aluno.user_id);
 const {data:linkData,error:linkError}=await db.auth.admin.generateLink({type:existente?"recovery":"invite",email,options:{redirectTo:destino,data:{nome_completo:nome}}});
 if(linkError||!linkData?.properties?.action_link||!linkData.user?.id){console.error("Falha ao gerar convite",linkError?.message);return {error:"Não foi possível preparar o convite de acesso",status:502}}
 const uid=linkData.user.id;
 if(existente&&aluno.user_id!==uid)return {error:"Conta vinculada não corresponde ao e-mail",status:409};
 if(!existente){const {error:up}=await db.from("alunos").update({user_id:uid}).eq("id",alunoId).is("user_id",null);if(up){console.error("Falha ao vincular conta",up.message);return {error:"Não foi possível vincular a conta ao cadastro",status:500}}}
 const url=linkData.properties.action_link;
 const {error:trackError}=await db.from("wand_convites_acesso").upsert({aluno_id:alunoId,proposta_id:propostaId,email_destino:email,auth_uid:uid,status:"pendente",atualizado_em:new Date().toISOString()},{onConflict:"aluno_id"});
 if(trackError){console.error("Falha ao registrar convite",trackError.message);return {error:"Não foi possível registrar o convite",status:500}}
 if(canal==="whatsapp")return {ok:true,url,email};
 if(!resend||!from)return {error:"E-mail de convite não configurado",status:503};
 const primeiro=esc(nome.trim().split(/\s+/)[0]||"aluno");
 const html='<div style="background:#0e0e0e;color:#f4e8d1;padding:36px 24px;font-family:Arial,sans-serif;max-width:620px;margin:auto"><img src="https://wandmethod.com.br/LogoNova.png" width="85" alt="WAND METHOD" style="display:block;margin:auto"><h1 style="text-align:center;color:#e2b95f">WAND METHOD</h1><h2 style="color:#f2d48f">Seu primeiro acesso está pronto</h2><p>Olá, '+primeiro+'!</p><p>Seu contrato foi aceito. Agora você pode definir sua senha e preparar seu acesso à plataforma WAND METHOD.</p><p>Seu login será o e-mail cadastrado. A senha será escolhida por você, em uma página segura.</p><p style="text-align:center;padding:20px"><a href="'+esc(url)+'" style="background:#ddb65c;color:#17120b;padding:16px 25px;border-radius:8px;text-decoration:none;font-weight:bold">CRIAR MINHA SENHA</a></p><p>O acesso aos treinos depende da confirmação de pagamento e da ativação pelo treinador.</p><p style="font-size:12px;color:#bcae90">Se você não reconhece esta solicitação, ignore a mensagem. Não compartilhe este link.</p></div>';
 const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+resend,"Content-Type":"application/json"},body:JSON.stringify({from,to:[email],subject:"WAND METHOD — crie sua senha de acesso",html})});
 if(!response.ok){console.error("Falha no envio de convite",response.status);return {error:"Não foi possível enviar o convite por e-mail",status:502}}
 await db.from("wand_convites_acesso").update({status:"enviado",enviado_em:new Date().toISOString(),erro_ultimo_envio:null}).eq("aluno_id",alunoId);
 return {ok:true};
}

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
  if(action==="convite_whatsapp"||action==="reenviar_convite"){
   const auth=req.headers.get("Authorization")||"";
   if(!auth.startsWith("Bearer "))return json({error:"Sessão necessária"},401);
   const {data:{user},error:authError}=await db.auth.getUser(auth.slice(7));
   if(authError||!user)return json({error:"Sessão inválida"},401);
   const {data:profile}=await db.from("profiles").select("role").eq("id",user.id).maybeSingle();
   if(profile?.role!=="admin")return json({error:"Acesso não autorizado"},403);
   const {data:prop}=await db.from("wand_propostas").select("id,aluno_id,status").eq("id",id).maybeSingle();
   if(!prop||prop.status!=="aceita")return json({error:"Contrato ainda não aceito"},409);
   const {data:aluno}=await db.from("alunos").select("nome_completo,email").eq("id",prop.aluno_id).maybeSingle();
   const email=String(aluno?.email||"").trim().toLowerCase();
   if(!email)return json({error:"Aluno sem e-mail"},422);
   const result=await prepararConvite(db,prop.aluno_id,id,email,String(aluno?.nome_completo||""),action==="convite_whatsapp"?"whatsapp":"email",resend,from);
   if(!result.ok)return json({error:result.error},result.status||500);
   return json(action==="convite_whatsapp"?{ok:true,url:result.url,email}:{ok:true,message:"Convite enviado por e-mail"});
  }
  if(action==="enviar"){
   const auth=req.headers.get("Authorization")||"";
   if(!auth.startsWith("Bearer "))return json({error:"Sessão necessária"},401);
   const {data:{user},error}=await db.auth.getUser(auth.slice(7));
   if(error||!user)return json({error:"Sessão inválida"},401);
   const {data:profile}=await db.from("profiles").select("role").eq("id",user.id).maybeSingle();
   if(profile?.role!=="admin")return json({error:"Acesso não autorizado"},403);
   const {data:p,error:proposalError}=await db.from("wand_propostas").select("id,aluno_id,status").eq("id",id).maybeSingle();
   if(proposalError){console.error("Erro ao consultar proposta",proposalError.code,proposalError.message);return json({error:"Falha ao consultar a proposta no banco ("+(proposalError.code||"desconhecido")+")"},500)}
   if(!p)return json({error:"Proposta não localizada no banco consultado pela função"},404);
   if(p.status!=="enviada")return json({error:"Proposta com status incompatível para envio"},409);
   const {data:aluno}=await db.from("alunos").select("nome_completo,email").eq("id",p.aluno_id).maybeSingle();
   const email=String(aluno?.email||"").trim().toLowerCase();
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:"Interessado sem e-mail válido"},422);
   if(!resend||!from)return json({error:"Envio por e-mail não configurado"},503);
   const token=random(),tokenHash=await hash(token);
   const {error:saveError}=await db.from("wand_contrato_verificacoes").upsert({proposta_id:id,email_destino:email,acesso_hash:tokenHash,acesso_expira_em:new Date(Date.now()+7*86400000).toISOString(),acesso_utilizado_em:null,codigo_hash:null,codigo_expira_em:null,codigo_tentativas:0,codigo_enviado_em:null,atualizado_em:new Date().toISOString()},{onConflict:"proposta_id"});
   if(saveError){console.error("Erro ao registrar link",saveError.message);return json({error:"Não foi possível preparar o acesso seguro"},500)}
   const link=origin+"/contrato-aceite.html?proposta="+encodeURIComponent(id)+"&chave="+token;
   const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+resend,"Content-Type":"application/json"},body:JSON.stringify({from,to:[email],subject:"Sua proposta WAND METHOD está disponível, "+(String(aluno?.nome_completo||"").trim().split(/\s+/)[0]||"aluno"),html:`<!doctype html><html lang="pt-BR"><body style="margin:0;padding:0;background:#f1f0ec;font-family:Arial,Helvetica,sans-serif;color:#f5f0e5"><div style="display:none;font-size:1px;color:#f1f0ec;max-height:0;overflow:hidden">Sua jornada de treinamento personalizado começa com uma escolha. Conheça sua proposta WAND METHOD.</div><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f1f0ec;padding:30px 12px"><tr><td align="center"><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#101010;border:1px solid #b78c42;border-radius:16px;overflow:hidden"><tr><td align="center" style="padding:35px 28px 24px;background:#15120d;border-bottom:1px solid #80602d"><img src="https://wandmethod.com.br/LogoNova.png" width="96" alt="Logo WAND METHOD" style="display:block;width:96px;max-width:100%;height:auto;margin:0 auto 12px"><div style="font-size:25px;font-weight:800;letter-spacing:3px;color:#e6bf6d">WAND METHOD</div><div style="font-size:11px;letter-spacing:2px;color:#bca57c;margin-top:7px">TREINAMENTO PERSONALIZADO</div></td></tr><tr><td style="padding:34px 32px 28px"><p style="font-size:15px;color:#e5c078;margin:0 0 14px;font-weight:bold">UMA NOVA ETAPA COMEÇA AQUI</p><h1 style="font-size:25px;line-height:1.3;color:#fff3d6;margin:0 0 22px">Olá, ${esc(String(aluno?.nome_completo||"").trim().split(/\s+/)[0]||"tudo bem")}!</h1><p style="font-size:16px;line-height:1.75;color:#eee5d5;margin:0 0 18px">Você está a um passo de começar uma experiência de treinamento pensada para respeitar sua individualidade, seus objetivos e sua evolução.</p><p style="font-size:16px;line-height:1.75;color:#eee5d5;margin:0 0 18px">No <strong style="color:#e9c577">WAND METHOD</strong>, acreditamos que treinar vai além de seguir exercícios: é contar com planejamento, acompanhamento profissional e atenção aos detalhes para construir uma rotina com propósito.</p><p style="font-size:16px;line-height:1.75;color:#eee5d5;margin:0 0 25px">Sua proposta personalizada já está disponível. Reserve alguns minutos para conhecer as condições do serviço e, se estiver de acordo, confirmar sua decisão com segurança.</p><table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="padding:9px 0 26px"><a href="${link}" style="display:inline-block;background:#d7a94e;color:#17110a;text-decoration:none;font-size:16px;font-weight:bold;padding:16px 27px;border-radius:9px">VISUALIZAR MINHA PROPOSTA</a></td></tr></table><div style="border-top:1px solid #66512d;padding-top:20px"><p style="font-size:14px;line-height:1.7;color:#d6c6a8;margin:0 0 10px"><strong style="color:#edcb83">Sua segurança é importante.</strong> Para consultar o documento, você receberá um código de confirmação no e-mail cadastrado.</p><p style="font-size:13px;line-height:1.6;color:#c8b898;margin:0">O link é individual, expira em 7 dias e não deve ser compartilhado. A leitura da proposta não significa aceite automático.</p></div><p style="font-size:15px;line-height:1.7;color:#f0e2c6;margin:27px 0 0">Será um prazer acompanhar você nessa jornada.<br><strong style="color:#e6bf6d">Equipe WAND METHOD</strong></p></td></tr><tr><td align="center" style="background:#0a0a0a;padding:21px 25px;border-top:1px solid #584425;color:#ab9c81;font-size:12px;line-height:1.7">WAND METHOD · Atendimento profissional e personalizado<br>Este e-mail foi enviado porque uma proposta foi preparada para você.<br>Se não reconhece esta solicitação, desconsidere a mensagem.</td></tr></table></td></tr></table></body></html>`})});
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
   if(aceitar){
    const {data:aluno}=await db.from("alunos").select("nome_completo,email").eq("id",(await db.from("wand_propostas").select("aluno_id").eq("id",id).single()).data?.aluno_id).maybeSingle();
    const email=String(aluno?.email||"").trim().toLowerCase();
    const {data:propostaAluno}=await db.from("wand_propostas").select("aluno_id").eq("id",id).single();
    if(propostaAluno?.aluno_id&&email){
     const invite=await prepararConvite(db,propostaAluno.aluno_id,id,email,String(aluno?.nome_completo||""),"email",resend,from);
     if(!invite.ok){console.error("Aceite registrado; convite pendente:",invite.error);return json({ok:true,message:"Contrato aceito e registrado. O convite de acesso ainda não pôde ser enviado; o treinador poderá reenviar."})}
    }
   }
   return json({ok:true,message:aceitar?"Contrato aceito e convite de acesso enviado":"Proposta recusada e registrada"});
  }
  return json({error:"Operação inválida"},400);
 }catch(e){console.error("Falha no fluxo de contratos",errorMessage(e));return json({error:"Erro ao processar a solicitação"},500)}
});
