#!/usr/bin/env bash
# Call a Design plugin tool from inside a Paperclip run.
# usage: bash design-tool.sh <design_status|design_render|design_feedback|design_set_status> ['{"json":"params"}']
set -euo pipefail
tool="$1"
params="${2:-}"
[ -z "$params" ] && params='{}'
api="${PAPERCLIP_API_URL:-${PAPERCLIP_API_BASE:-http://127.0.0.1:3100}}"
auth=(-H "Authorization: Bearer $PAPERCLIP_API_KEY" -H "X-Paperclip-Run-Id: ${PAPERCLIP_RUN_ID:-}" -H "Content-Type: application/json")
json() { node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>{const v=process.argv[1].split(".").reduce((o,k)=>o?.[k],JSON.parse(s));console.log(v??"")})' "$1"; }

me=$(curl -sf "${auth[@]}" "$api/api/agents/me")
agent=$(echo "$me" | json id)
company="${PAPERCLIP_COMPANY_ID:-$(echo "$me" | json companyId)}"
project="${DESIGN_PROJECT_ID:-}"
if [ -z "$project" ] && [ -n "${PAPERCLIP_TASK_ID:-}" ]; then
  project=$(curl -sf "${auth[@]}" "$api/api/issues/$PAPERCLIP_TASK_ID" | json projectId)
fi
[ -z "$project" ] && { echo "No project: set DESIGN_PROJECT_ID or run from an issue that belongs to a project." >&2; exit 2; }

body=$(node -e 'const [t,p,a,r,c,pr]=process.argv.slice(1);console.log(JSON.stringify({tool:"onenomad-design:"+t,parameters:JSON.parse(p),runContext:{agentId:a,runId:r,companyId:c,projectId:pr}}))' \
  "$tool" "$params" "$agent" "${PAPERCLIP_RUN_ID:-}" "$company" "$project")
curl -s "${auth[@]}" -X POST "$api/api/plugins/tools/execute" -d "$body" \
  | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>{const d=JSON.parse(s);const r=d.result??d;console.log(r.content??r.error??JSON.stringify(d));if(r.error||d.error)process.exit(1)})'
