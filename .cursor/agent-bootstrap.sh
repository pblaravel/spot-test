#!/usr/bin/env bash
# Idempotent dependency refresh for Cursor Cloud Agents.
# Runs from the repository root. Does not start Docker Compose, Redis, or other daemons.

set -euo pipefail

resolve_root() {
  if [[ -n "${CURSOR_REPO_ROOT:-}" && -d "${CURSOR_REPO_ROOT}" ]]; then
    printf '%s' "${CURSOR_REPO_ROOT}"
    return 0
  fi
  local script_dir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  cd "${script_dir}/.." && pwd
}

log() { printf '[agent-bootstrap] %s\n' "$*"; }
warn() { printf '[agent-bootstrap] WARN %s\n' "$*" >&2; }

ROOT="$(resolve_root)"
cd "${ROOT}" || {
  warn "cannot cd to repo root"
  exit 1
}

log "repo root: ${ROOT}"

if command -v docker >/dev/null 2>&1; then
  if docker info >/dev/null 2>&1; then
    log "docker: daemon is reachable"
  else
    warn "docker: daemon not reachable (expected until dockerd is started)"
  fi
  if docker compose version >/dev/null 2>&1; then
    ver="$(docker compose version --short 2>/dev/null || docker compose version 2>/dev/null | head -1)"
    log "docker compose (v2): ${ver}"
  else
    warn "docker compose v2 plugin not available"
  fi
else
  warn "docker CLI not found"
fi

if command -v redis-server >/dev/null 2>&1; then
  log "redis-server: installed"
else
  warn "redis-server binary not found"
fi

if [[ -d frontend && -f frontend/package.json && -f frontend/pnpm-lock.yaml ]]; then
  if command -v pnpm >/dev/null 2>&1; then
    log "frontend: running pnpm install --frozen-lockfile"
    (cd frontend && pnpm install --frozen-lockfile)
  else
    warn "pnpm not on PATH; skipping frontend install"
  fi
else
  log "frontend: skipping (need frontend/package.json and frontend/pnpm-lock.yaml)"
fi

if [[ -d api-gateway && -f api-gateway/package.json ]]; then
  if command -v npm >/dev/null 2>&1; then
    if [[ -f api-gateway/package-lock.json ]]; then
      log "api-gateway: running npm ci"
      (cd api-gateway && npm ci)
    else
      log "api-gateway: running npm install (no package-lock.json)"
      (cd api-gateway && npm install)
    fi
  else
    warn "npm not on PATH; skipping api-gateway install"
  fi
else
  log "api-gateway: skipping (need api-gateway/package.json)"
fi

log "done"
