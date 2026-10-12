"""Minimal PixelLab (https://api.pixellab.ai/v2) client for making Study Eagle animations.

The API key comes from the PIXELLAB_API_KEY environment variable (set it as a secret in
the cloud environment settings) or, failing that, from a gitignored .env in the repo
root. The key is never printed.

Usage (run from anywhere; @paths and relative paths resolve from the repo root):
  python3 -I scripts/pixellab.py balance                          free: checks auth, shows generations left
  python3 -I scripts/pixellab.py call <endpoint> <body.json> <out_prefix>
  python3 -I scripts/pixellab.py poll <job_id> <out_prefix>       re-fetch a finished job without paying again

Every 'call' spends a generation and is never retried automatically. PixelLab runs one
job at a time per account (HTTP 429 otherwise). In the request body, a string value
"@path/to/image.png" is sent as that image. The job id is saved to <out_prefix>_jobid.txt
as soon as the job is created, so a dropped connection can be resumed with 'poll'.
"""
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = os.environ.get("PIXELLAB_BASE", "https://api.pixellab.ai/v2")


def key():
    if os.environ.get("PIXELLAB_API_KEY"):
        return os.environ["PIXELLAB_API_KEY"].strip()
    env = ROOT / ".env"
    if env.exists():
        for line in env.read_text().splitlines():
            if line.startswith("PIXELLAB_API_KEY="):
                return line.split("=", 1)[1].strip()
    raise SystemExit("PIXELLAB_API_KEY is not set (environment variable or .env in the repo root)")


def request(method, path, body=None):
    req = urllib.request.Request(BASE + "/" + path.lstrip("/"), method=method,
                                 data=None if body is None else json.dumps(body).encode(),
                                 headers={"Authorization": "Bearer " + key(), "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")[:500]
        raise SystemExit(f"HTTP {e.code} on {method} {path}: {detail} | retry-after={e.headers.get('Retry-After')}")


def resolve(p):
    p = Path(p)
    return p if p.is_absolute() else ROOT / p


def b64_png(path):
    return {"type": "base64", "base64": base64.b64encode(resolve(path).read_bytes()).decode()}


def save_images(obj, prefix, found=None):
    """Write every base64 image in the response to <prefix>_<n>.png."""
    found = found if found is not None else []
    if isinstance(obj, dict):
        if obj.get("type") == "base64" and "base64" in obj:
            p = f"{prefix}_{len(found)}.png"
            Path(p).write_bytes(base64.b64decode(obj["base64"]))
            found.append(p)
        else:
            for v in obj.values():
                save_images(v, prefix, found)
    elif isinstance(obj, list):
        for v in obj:
            save_images(v, prefix, found)
    return found


def main(args):
    if args[0] == "balance":
        print(json.dumps(request("GET", "balance"), indent=1))
    elif args[0] == "poll":
        job, prefix = args[1:3]
        res = request("GET", "background-jobs/" + job)
        print("status", res.get("status"))
        print("saved", save_images(res, prefix))
    elif args[0] == "call":
        endpoint, body_path, prefix = args[1:4]
        body = json.loads(resolve(body_path).read_text())
        for k, v in list(body.items()):
            if isinstance(v, str) and v.startswith("@"):
                body[k] = b64_png(v[1:])
        res = request("POST", endpoint, body)
        job = res.get("background_job_id") or res.get("job_id")
        if job:
            Path(prefix + "_jobid.txt").write_text(job)
            print("job created", job)
            for _ in range(90):
                time.sleep(5)
                res = request("GET", "background-jobs/" + job)
                if res.get("status") in ("completed", "failed", "cancelled"):
                    break
            print("job", job, "status", res.get("status"))
        files = save_images(res, prefix)
        meta = {k: v for k, v in res.items() if not isinstance(v, (dict, list)) or k == "usage"}
        print("saved", files, "| meta", json.dumps(meta)[:300])
    else:
        raise SystemExit(__doc__)


if __name__ == "__main__":
    main(sys.argv[1:] or ["help"])
