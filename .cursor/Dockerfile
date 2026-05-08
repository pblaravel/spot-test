# Base image for Cursor Cloud Agents (see .cursor/environment.json).
# Do not COPY the repo — the platform mounts the workspace after checkout.

FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        git \
        redis-server \
        docker.io \
        docker-compose-v2 \
        nodejs \
        npm \
    && rm -rf /var/lib/apt/lists/*

# pnpm for conditional frontend installs in agent-bootstrap.sh
RUN corepack enable \
    && corepack prepare pnpm@9.15.5 --activate

# Typical cloud VM user; allow using Docker socket when a daemon is present
RUN groupadd -f docker 2>/dev/null || true \
    && (id -u ubuntu >/dev/null 2>&1 && usermod -aG docker ubuntu || true)

WORKDIR /workspace
