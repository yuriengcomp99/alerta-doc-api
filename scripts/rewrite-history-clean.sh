#!/bin/sh
set -e
export GIT_AUTHOR_NAME="yuriengcomp99"
export GIT_COMMITTER_NAME="yuriengcomp99"
export GIT_AUTHOR_EMAIL="yuri.engcomp99@gmail.com"
export GIT_COMMITTER_EMAIL="yuri.engcomp99@gmail.com"

GIT="${GIT_EXE:-/c/Program Files/Git/bin/git.exe}"

T1=$("$GIT" rev-parse 'ad1c68d^{tree}')
C1=$("$GIT" commit-tree "$T1" -m "Initial commit: API core do Alerta Doc com auth, documentos, Swagger e Docker.")

T2=$("$GIT" rev-parse '176e7fe^{tree}')
C2=$("$GIT" commit-tree "$T2" -p "$C1" -m "feat(db): add notifications table with basic fields")

T3=$("$GIT" rev-parse '01b0c53^{tree}')
MSG=$(mktemp)
cat > "$MSG" <<'EOF'
feat(db): link notifications to users

Add user_id foreign key on notifications with cascade delete
and index. Sync schema in alerta-doc-schedule.
EOF
C3=$("$GIT" commit-tree "$T3" -p "$C2" -F "$MSG")
rm -f "$MSG"

"$GIT" update-ref refs/heads/main "$C3"
echo "NEW_MAIN=$C3"
"$GIT" log --format="%H%n%B---" -3
