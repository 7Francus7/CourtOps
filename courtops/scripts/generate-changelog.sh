#!/bin/bash
# Generates a formatted changelog from git commit history.
# Usage:
#   ./scripts/generate-changelog.sh              # Last 7 days
#   ./scripts/generate-changelog.sh 30           # Last 30 days
#   ./scripts/generate-changelog.sh 7 > CHANGELOG.md  # Save to file

DAYS=${1:-7}
SINCE=$(date -d "-${DAYS} days" +%Y-%m-%d 2>/dev/null || date -v-${DAYS}d +%Y-%m-%d)
TODAY=$(date +%Y-%m-%d)

echo "# Changelog"
echo ""
echo "## ${TODAY} (ultimos ${DAYS} dias)"
echo ""

print_section() {
  local prefix="$1"
  local title="$2"
  local commits
  commits=$(git log --oneline --since="${SINCE}" --format="%s (%h)" --grep="^${prefix}[:(]" 2>/dev/null)
  if [ -n "$commits" ]; then
    echo "### ${title}"
    echo ""
    echo "$commits" | sed "s/^${prefix}: /- /; s/^${prefix}(/- (/"
    echo ""
  fi
}

print_section "feat"     "Nuevas Funcionalidades"
print_section "fix"      "Correcciones"
print_section "ui"       "Mejoras de Interfaz"
print_section "style"    "Estilos"
print_section "refactor" "Refactoring"
print_section "perf"     "Performance"
print_section "docs"     "Documentacion"
print_section "test"     "Tests"
print_section "chore"    "Mantenimiento"

# Stats
TOTAL=$(git log --oneline --since="${SINCE}" 2>/dev/null | wc -l | tr -d ' ')
AUTHORS=$(git log --since="${SINCE}" --format="%aN" 2>/dev/null | sort -u | tr '\n' ', ' | sed 's/,$//')
echo "---"
echo ""
echo "**${TOTAL} commits** | Autores: ${AUTHORS}"
