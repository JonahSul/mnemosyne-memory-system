FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

# Install additional OS packages for building native modules (e.g., better-sqlite3) and network tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y --no-install-recommends \
        build-essential \
        python3 \
        sqlite3 \
        libsqlite3-dev \
        curl \
        ca-certificates \
        git \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Enable corepack for pnpm (v11 / latest)
RUN corepack enable && corepack prepare pnpm@latest --activate
