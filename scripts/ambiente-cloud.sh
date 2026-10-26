#!/usr/bin/env bash
# resumo: Prepara o container do Claude Code na nuvem para os projetos - confere ferramentas, instala o .NET pelo apt, sobe o Docker, puxa imagem pelo espelho e aponta o Playwright para o Chromium local.
#
# Uso:
#   scripts/ambiente-cloud.sh verificar            o que está instalado e o que falta
#   scripts/ambiente-cloud.sh dotnet               .NET SDK 10 pelo apt (download da Microsoft é bloqueado)
#   scripts/ambiente-cloud.sh docker               sobe o dockerd em segundo plano, se não estiver rodando
#   scripts/ambiente-cloud.sh imagem <nome:tag>    puxa do mirror.gcr.io e renomeia (Docker Hub devolve 429)
#   eval "$(scripts/ambiente-cloud.sh playwright)" exporta o caminho do Chromium já instalado
#
# Detalhes e armadilhas: memorias/ambiente-cloud.md
set -euo pipefail

readonly CHROMIUM_PATH="/opt/pw-browsers/chromium"
readonly PROXY_CA="/root/.ccr/ca-bundle.crt"
readonly DOCKERD_LOG="${TMPDIR:-/tmp}/dockerd.log"

log() { printf '%s\n' "$*" >&2; }

as_root() {
  if [[ "$(id -u)" -eq 0 ]]; then
    "$@"
  elif command -v sudo >/dev/null 2>&1; then
    sudo "$@"
  else
    log "Precisa de root para: $*"
    return 1
  fi
}

check() {
  local label="$1"
  shift
  local output
  if output="$("$@" 2>/dev/null | head -n 1)" && [[ -n "$output" ]]; then
    printf '  ok     %-12s %s\n' "$label" "$output"
  else
    printf '  falta  %s\n' "$label"
  fi
}

cmd_verificar() {
  echo "Ferramentas:"
  check node node --version
  check npm npm --version
  check dotnet dotnet --version
  check docker docker --version
  check git git --version
  check shellcheck shellcheck --version
  echo "Serviços e caminhos:"
  if docker info >/dev/null 2>&1; then echo "  ok     dockerd rodando"; else echo "  falta  dockerd (scripts/ambiente-cloud.sh docker)"; fi
  if [[ -x "$CHROMIUM_PATH" ]]; then echo "  ok     Chromium em $CHROMIUM_PATH"; else echo "  falta  Chromium em $CHROMIUM_PATH"; fi
  if [[ -f "$PROXY_CA" ]]; then echo "  ok     CA do proxy em $PROXY_CA"; else echo "  info   sem CA de proxy (fora do container da nuvem?)"; fi
}

cmd_dotnet() {
  if dotnet --list-sdks 2>/dev/null | grep -q '^10\.'; then
    log ".NET SDK 10 já instalado: $(dotnet --version)"
    return 0
  fi
  as_root apt-get update
  as_root apt-get install -y dotnet-sdk-10.0
  dotnet --version
}

cmd_docker() {
  if docker info >/dev/null 2>&1; then
    log "dockerd já está rodando."
    return 0
  fi
  if ! command -v dockerd >/dev/null 2>&1; then
    log "dockerd não está instalado neste container."
    return 1
  fi
  log "Subindo dockerd (log em $DOCKERD_LOG)..."
  as_root bash -c "nohup dockerd >'$DOCKERD_LOG' 2>&1 &"
  local attempt
  for attempt in $(seq 1 30); do
    if docker info >/dev/null 2>&1; then
      log "dockerd pronto em ${attempt}s. Lembre: TESTCONTAINERS_RYUK_DISABLED=true."
      return 0
    fi
    sleep 1
  done
  log "dockerd não respondeu em 30s; veja $DOCKERD_LOG"
  return 1
}

cmd_imagem() {
  local image="${1:-}"
  if [[ ! "$image" =~ ^[a-z0-9]+([._/-][a-z0-9]+)*:[A-Za-z0-9._-]+$ ]]; then
    log "Uso: scripts/ambiente-cloud.sh imagem <nome:tag>  (ex.: postgres:18-alpine)"
    return 2
  fi
  # Imagem oficial (sem barra) mora em library/ no espelho.
  local source="mirror.gcr.io/$image"
  [[ "$image" == */* ]] || source="mirror.gcr.io/library/$image"
  docker pull "$source"
  docker tag "$source" "$image"
  log "Pronto: $image (de $source)"
}

cmd_playwright() {
  if [[ ! -x "$CHROMIUM_PATH" ]]; then
    log "Chromium não encontrado em $CHROMIUM_PATH. Não rode playwright install; confira o container."
    return 1
  fi
  printf 'export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=%q\n' "$CHROMIUM_PATH"
}

usage() {
  sed -n '4,9p' "$0" | sed 's/^# \{0,1\}//'
}

main() {
  local command="${1:-}"
  [[ $# -gt 0 ]] && shift
  case "$command" in
    verificar) cmd_verificar ;;
    dotnet) cmd_dotnet ;;
    docker) cmd_docker ;;
    imagem) cmd_imagem "$@" ;;
    playwright) cmd_playwright ;;
    -h | --ajuda | ajuda | "") usage ;;
    *)
      log "Comando desconhecido: $command"
      usage >&2
      return 2
      ;;
  esac
}

main "$@"
