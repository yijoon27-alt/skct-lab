#!/bin/zsh
cd -- "$(dirname -- "$0")" || exit 1
if ! command -v npm >/dev/null 2>&1; then
  print 'Node.js 24 LTS를 설치한 뒤 다시 실행하세요.'
  read 'answer?Enter를 눌러 종료합니다.'
  exit 1
fi
if [ ! -d node_modules ]; then
  npm ci || exit 1
fi
npm run dev -- --open
