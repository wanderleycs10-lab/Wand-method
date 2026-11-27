"""Valida o ciclo de Treinos via Auth e Data API apenas na homologação."""
import json
import os
import re
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import HTTPRedirectHandler, Request, build_opener
from uuid import uuid4

API = "https://kcusxtfvcwqdflszqjes.supabase.co"


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def request(key, path, token=None, data=None, method=None, expected=(200,)):
    headers = {"apikey": key, "Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if method == "PATCH":
        headers["Prefer"] = "return=representation"
    body = json.dumps(data).encode() if data is not None else None
    req = Request(API + path, data=body, headers=headers, method=method)
    try:
        with build_opener(NoRedirect).open(req, timeout=20) as response:
            status, raw = response.status, response.read()
    except HTTPError as error:
        status, raw = error.code, error.read()
    if status not in expected:
        raise RuntimeError(f"{method or req.get_method()} {path.split('?')[0]} retornou HTTP {status}.")
    return json.loads(raw) if raw else None


def run():
    key = os.environ.get("WAND_STAGING_PUBLIC_KEY", "")
    names = ("WAND_QA_COACH_PASSWORD", "WAND_QA_ALUNO_A_PASSWORD", "WAND_QA_ALUNO_B_PASSWORD")
    if not re.fullmatch(r"sb_publishable_[\w-]+", key, re.ASCII) or not all(os.environ.get(n) for n in names):
        raise RuntimeError("Configure a chave publicável de homologação e as três senhas fictícias no cofre do ambiente.")
    settings = request(key, "/auth/v1/settings")
    if settings.get("disable_signup") is not True:
        raise RuntimeError("O cadastro público da homologação precisa estar desativado.")

    def login(email, password_name):
        result = request(key, "/auth/v1/token?grant_type=password", data={
            "email": email, "password": os.environ[password_name],
        })
        if result["user"]["email"] != email:
            raise RuntimeError("O Auth devolveu uma identidade inesperada.")
        return result["access_token"]

    coach, student, other = (login(email, name) for email, name in zip(
        ("coach@wand.test", "aluno-a@wand.test", "aluno-b@wand.test"), names
    ))

    def rest(token, table, filters=None, **kwargs):
        return request(key, "/rest/v1/" + table + ("?" + urlencode(filters) if filters else ""), token, **kwargs)

    def rpc(token, name, payload, expected=(200,)):
        return rest(token, "rpc/" + name, data=payload, expected=expected)

    def insert(token, table, row):
        rest(token, table, data=row, expected=(201,))

    coach_row, = rest(coach, "profiles", {"select": "id,role"})
    student_row, = rest(student, "alunos", {"select": "id,user_id"})
    other_row, = rest(other, "alunos", {"select": "id,user_id"})
    if coach_row["role"] != "admin" or student_row["id"] == other_row["id"]:
        raise RuntimeError("Perfis fictícios estão inconsistentes.")

    ids = {name: str(uuid4()) for name in ("exercise", "workout", "item", "series", "program")}
    title = "QA Treinos " + ids["workout"][:8]
    insert(coach, "wand_exercicios", {
        "id": ids["exercise"], "nome": title, "grupo_muscular": "Peito",
        "ativo": True, "status_revisao": "aprovado",
    })
    insert(coach, "wand_treinos", {
        "id": ids["workout"], "aluno_id": student_row["id"], "nome": title,
    })
    insert(coach, "wand_treino_exercicios", {
        "id": ids["item"], "treino_id": ids["workout"], "exercicio_id": ids["exercise"],
    })
    insert(coach, "wand_treino_series", {
        "id": ids["series"], "treino_exercicio_id": ids["item"], "numero_serie": 1, "repeticoes": "10",
    })
    insert(coach, "wand_programas_treino", {
        "id": ids["program"], "aluno_id": student_row["id"], "treinador_id": coach_row["id"], "nome": title,
    })
    insert(coach, "wand_programa_fichas", {
        "programa_id": ids["program"], "ordem": 1, "codigo": "A", "treino_id": ids["workout"],
    })
    if rpc(coach, "wand_publicar_programa", {"p_programa_id": ids["program"], "p_quantidade": 1}) != 1:
        raise RuntimeError("A publicação não confirmou uma ficha.")
    session = rpc(student, "wand_iniciar_sessao", {"p_treino_id": ids["workout"]})
    load = {
        "p_sessao_id": session, "p_serie_id": ids["series"], "p_repeticoes": 10,
        "p_carga": 18.5, "p_concluida": True, "p_observacoes": None,
    }
    rpc(student, "wand_salvar_serie", load, expected=(200, 204))
    filters = {"id": "eq." + ids["workout"]}
    if rest(other, "wand_treinos", filters):
        raise RuntimeError("Aluno B conseguiu ler o treino do aluno A.")
    if rest(other, "wand_treinos", filters, method="PATCH", data={"nome": "Alteração indevida"}):
        raise RuntimeError("Aluno B conseguiu modificar o treino do aluno A.")
    finish = {"p_sessao_id": session, "p_observacoes": None}
    for name, data, error_text in (
        ("wand_iniciar_sessao", {"p_treino_id": ids["workout"]}, "Treino indisponivel"),
        ("wand_salvar_serie", load, "Sessão não encontrada"),
        ("wand_finalizar_sessao", finish, "Sessão não encontrada"),
    ):
        denied = rpc(other, name, data, expected=(400,))
        if denied.get("code") != "P0001" or not denied.get("message", "").startswith(error_text):
            raise RuntimeError(f"{name} não comprovou a negativa de titularidade esperada.")
    rpc(student, "wand_finalizar_sessao", finish, expected=(200, 204))
    history_a = json.dumps(rpc(student, "wand_aluno_historico", {}))
    history_b = json.dumps(rpc(other, "wand_aluno_historico", {}))
    if title not in history_a or "18.5" not in history_a or title in history_b:
        raise RuntimeError("O histórico não confirmou a carga ou o isolamento esperado.")
    print(f"Auth e ciclo de Treinos aprovados na homologação. Registro fictício: {title}.")


if __name__ == "__main__":
    run()
