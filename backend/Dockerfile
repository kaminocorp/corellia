# Builds the Corellia backend and the display client into one image that
# serves both. Build context is the repository root:
#   docker build -f backend/Dockerfile -t corellia .
# The root .dockerignore keeps backend/.env (API keys), backend/data and the
# host's node_modules out of the context; the image takes only the binary
# and client/dist.
FROM node:24-alpine AS client
WORKDIR /src
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY client/package.json client/
RUN corepack enable && pnpm install --frozen-lockfile
COPY shared shared
COPY client client
RUN pnpm -C client build

FROM golang:1.26-alpine AS backend
WORKDIR /src
COPY go.work go.work.sum ./
COPY backend backend
COPY shared shared
ARG VERSION=dev
ARG COMMIT=unknown
RUN cd backend && CGO_ENABLED=0 go build -ldflags "-X main.version=${VERSION} -X main.commit=${COMMIT}" -o /out/api ./cmd/api

FROM alpine:3.21
RUN apk add --no-cache ca-certificates tzdata && adduser -D -h /app corellia
WORKDIR /app
COPY --from=backend /out/api /app/api
COPY --from=client /src/client/dist /app/client
# The container is reached over the bridge network, never loopback, so it
# needs a CORELLIA_DEVICE_TOKEN (dev mode would refuse every client) and
# must listen on all interfaces. Set TZ (or CORELLIA_TZ) so reminders fire
# and the clock reads in the owner's zone; tzdata is installed.
# Voice needs a secure context in the browser: a display that opens this
# container at http://<host>:8080 from another machine gets no microphone.
# Put HTTPS in front (a reverse proxy, or `tailscale serve`), or open it
# from the same machine on http://localhost:8080; see README.md.
ENV CORELLIA_CLIENT_DIR=/app/client CORELLIA_DATA_DIR=/data PORT=8080 CORELLIA_BIND=0.0.0.0
# /data must exist and belong to the app user before VOLUME: a path that is
# not in the image is created root:root, the non-root server then cannot
# write it, and every note, reminder and transcript line is lost on restart
# (review 2026-10-30 round 5). The server now refuses to start on an
# unwritable data dir and reports write failures on /healthz, so a volume
# mounted over /data with the wrong owner fails loudly instead:
#   docker run -v corellia-data:/data ...        # named volume: owner copied from the image
#   docker run -v /srv/corellia:/data ...        # bind mount: chown it to the image's corellia uid first
RUN mkdir -p /data && chown corellia:corellia /data
VOLUME ["/data"]
USER corellia
EXPOSE 8080
ENTRYPOINT ["/app/api"]
