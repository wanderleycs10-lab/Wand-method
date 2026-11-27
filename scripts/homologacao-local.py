"""Serve uma cópia temporária do cliente WAND METHOD apontada ao Supabase de homologação."""
import base64
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from tempfile import TemporaryDirectory

ROOT = Path(__file__).resolve().parents[1]
LOCAL_API = "http://127.0.0.1:54321"
APP = "http://127.0.0.1:4180"
PRODUCTION_REF = "kvxdnreipuahoaostlle"
PUBLIC_KEY = re.compile(r"sb_publishable_[A-Za-z0-9_-]+")
PRODUCTION = re.compile(r"kvxdnreipuahoaostlle|wandmethod\.com\.br|wa\.me", re.I)
ASSETS = {".css", ".gif", ".jpg", ".png", ".pdf", ".webp"}
def target(ref, key):
    if not ref:
        return LOCAL_API, public_key(key)
    if not re.fullmatch(r"[a-z0-9]{20}", ref) or ref == PRODUCTION_REF:
        raise ValueError("Informe a referência do projeto Supabase exclusivo de homologação.")
    if not PUBLIC_KEY.fullmatch(key):
        raise ValueError("Use a chave publicável do projeto de homologação.")
    return f"https://{ref}.supabase.co", key


def content_security_policy(api):
    if api == LOCAL_API:
        connections = f"{api} ws://127.0.0.1:54321"
    else:
        # A interface usa login por senha, sem acesso a rotas de envio de e-mail
        # do Auth ou a funções de envio. As restrições também são exigidas no servidor.
        paths = ("auth/v1/token", "auth/v1/user", "auth/v1/logout", "rest/v1/", "storage/v1/")
        connections = " ".join(f"{api}/{path}" for path in paths)
    return (
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
        f"connect-src 'self' {connections}; "
        f"img-src 'self' data: blob: {api}/storage/v1/; style-src 'self' 'unsafe-inline'; "
        "font-src 'self'; form-action 'self'; frame-src 'none'; worker-src 'none'; "
        "object-src 'none'; base-uri 'none'; frame-ancestors 'none'"
    )


def public_key(key):
    if PUBLIC_KEY.fullmatch(key):
        return key
    if re.fullmatch(r"[\w-]+\.[\w-]+\.[\w-]+", key, re.ASCII):
        try:
            payload = key.split(".")[1]
            claims = json.loads(base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)))
            if claims.get("role") == "anon" and claims.get("iss") == "supabase-demo":
                return key
        except (ValueError, AttributeError):
            pass
    raise ValueError("Forneça a chave publicável ou anon da instância local.")


def prepare(destination, key, api=LOCAL_API):
    tracked = subprocess.check_output(["git", "ls-files", "-z"], cwd=ROOT).decode().split("\0")
    inventory = (ROOT / "docs/design-system-wand-method.md").read_text()
    active_pages = {
        name for name, classification in re.findall(r"^\| `([^`]+\.html)` \| ([^|]+)", inventory, re.M)
        if "histórico" not in classification
    }
    for name in filter(None, tracked):
        relative = Path(name)
        root_file = len(relative.parts) == 1
        asset = relative.suffix in ASSETS and (root_file or relative.parts[0] in {"icons", "imagens"})
        source = root_file and (name in active_pages or relative.suffix in {".js", ".webmanifest"})
        if not (asset or source):
            continue
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        if asset:
            shutil.copyfile(ROOT / relative, target)
            continue
        content = (ROOT / relative).read_text()
        if key in content:
            raise ValueError(f"A chave informada já consta no cliente versionado: {name}.")
        content = content.replace(f"https://{PRODUCTION_REF}.supabase.co", api)
        content = PUBLIC_KEY.sub(lambda _: key, content)
        content = re.sub(r"https://(?:www\.)?wandmethod\.com\.br", APP, content)
        content = content.replace("https://wa.me", APP + "/contato-externo-desativado")
        if name in {"pwa-init.js", "sw.js"}:
            content = "// Service worker desabilitado na homologação local.\n"
        if PRODUCTION.search(content):
            raise ValueError(f"Referência de produção remanescente: {name}.")
        target.write_text(content)


class LocalHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, csp, **kwargs):
        self.csp = csp
        super().__init__(*args, **kwargs)

    def end_headers(self):
        self.send_header("Content-Security-Policy", self.csp)
        self.send_header("Cache-Control", "no-store")
        self.send_header("Referrer-Policy", "no-referrer")
        super().end_headers()

    def log_message(self, *_):
        """Não registrar URLs que possam conter tokens de teste."""


if __name__ == "__main__":
    ref = os.environ.get("WAND_STAGING_REF", "")
    key = os.environ.get("WAND_STAGING_PUBLIC_KEY" if ref else "WAND_LOCAL_PUBLIC_KEY", "")
    api, key = target(ref, key)
    with TemporaryDirectory(prefix="wand-homologacao-") as directory:
        prepare(Path(directory), key, api)
        handler = partial(LocalHandler, directory=directory, csp=content_security_policy(api))
        with ThreadingHTTPServer(("127.0.0.1", 4180), handler) as server:
            print(f"Homologação em {APP}; API em {api}.", flush=True)
            server.serve_forever()
