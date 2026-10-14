# Packages one upstream release of God's Eye View.
# Provider routes run inside Vite's preview server, so the runtime image keeps
# Node and the production dependencies. API keys are runtime environment
# variables (see .env.example); they are not baked into the image.
FROM node:24.14.0-bookworm-slim

ARG GEV_VERSION=dev

LABEL org.opencontainers.image.title="God's Eye View" \
      org.opencontainers.image.description="Local God's Eye View globe, packaged from an upstream release." \
      org.opencontainers.image.version="${GEV_VERSION}" \
      org.opencontainers.image.licenses="MIT"

ENV HOST=0.0.0.0 \
    PORT=4173 \
    PUPPETEER_SKIP_DOWNLOAD=1 \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false

RUN mkdir -p /app && chown node:node /app
WORKDIR /app

COPY --chown=node:node package.json package-lock.json ./

USER node

RUN npm ci

COPY --chown=node:node . .

RUN npm run build \
    && npm cache clean --force \
    && rm -rf /home/node/.npm

EXPOSE 4173

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4173)+'/').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["sh", "-c", "exec node node_modules/vite/bin/vite.js preview --host \"${HOST}\" --port \"${PORT}\" --strictPort"]
