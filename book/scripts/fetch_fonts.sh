#!/usr/bin/env bash
# Noto Serif KR (SIL OFL 1.1) 를 npm 패키지에서 받아 book/fonts/ 에 배치한다.
set -euo pipefail
cd "$(dirname "$0")/.."
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
( cd "$tmp" && npm pack @expo-google-fonts/noto-serif-kr >/dev/null && tar xzf ./*.tgz )
mkdir -p fonts
cp "$tmp"/package/400Regular/NotoSerifKR_400Regular.ttf fonts/
cp "$tmp"/package/600SemiBold/NotoSerifKR_600SemiBold.ttf fonts/
echo "fonts ready:"; ls -la fonts
