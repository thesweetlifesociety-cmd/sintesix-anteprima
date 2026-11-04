# Scarica dal vecchio sito sintesix.it le pagine elencate in pagine.txt e le immagini
# caricate (/public/uploads/...) che quelle pagine richiamano, nella versione a piena risoluzione.
import os, re, time, urllib.request, urllib.parse
BASE = "https://www.sintesix.it"
UA = {"User-Agent": "Mozilla/5.0 (compatible; sintesix-import/1.0)"}
def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()
os.makedirs("_import/html", exist_ok=True); os.makedirs("_import/uploads", exist_ok=True)
log = []
imgs = set()
for path in [l.strip() for l in open("_import/pagine.txt") if l.strip()]:
    name = path.strip("/").replace("/", "__").replace("?", "_").replace("=", "-") or "home"
    try:
        data = get(BASE + path)
        open(f"_import/html/{name}.html", "wb").write(data)
        log.append(f"OK {path} {len(data)}")
        for m in re.findall(r'/public/uploads/[^"\'\s<>?)]+?\.(?:jpe?g|png|gif|webp|svg|pdf|mp3|m4a)', data.decode("utf-8", "replace"), re.I):
            imgs.add(m)
            imgs.add(re.sub(r'-\d+x\d+(\.\w+)$', r'\1', m))
    except Exception as e:
        log.append(f"ERR {path} {e}")
    time.sleep(0.5)
extra = [l.strip() for l in open("_import/extra.txt") if l.strip()] if os.path.exists("_import/extra.txt") else []
for m in sorted(imgs) + extra:
    dest = ("_import/uploads/" + m[len("/public/uploads/"):]) if m.startswith("/public/uploads/") else "_import/extra/" + m.rsplit("/", 1)[-1]
    if os.path.exists(dest): continue
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    try:
        data = get(BASE + urllib.parse.quote(urllib.parse.unquote(m)))
        open(dest, "wb").write(data)
        log.append(f"OK {m} {len(data)}")
    except Exception as e:
        log.append(f"ERR {m} {e}")
    time.sleep(0.2)
open("_import/log.txt", "w").write("\n".join(log) + "\n")
print("\n".join(log[-20:]))
