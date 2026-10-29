# Builds the Corellia backend and the display client into one image that
# serves both. Build context is the repository root:
#   docker build -f backend/Dockerfile -t corellia .
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
ENV CORELLIA_CLIENT_DIR=/app/client CORELLIA_DATA_DIR=/data PORT=8080
VOLUME ["/data"]
USER corellia
EXPOSE 8080
ENTRYPOINT ["/app/api"]
