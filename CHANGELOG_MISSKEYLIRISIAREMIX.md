<!--
## 2025.x.x

### NOTE
- 

### General
- 

### Client
- 

### Server
- 

---

-->

## 	2025.4.0-lirisia (unreleased)

### NOTE
- ライブラリ起因の脆弱性を修正しました。 本アップデートは必ず実行してください。
- リポジトリが catsmiry/misskey → lirisianet/misskey になりました。
- リポジトリ変更をお願いいたします。
```
git remote set-url origin https://github.com/lirixia/misskey.git
git pull -ff
```
### General
- Misskey 2025.4.0(CherryPick 4.16.0-rc.1)に追従
- Misskey Miry Remix → Misskey Lirisia Remixになりました。(主なメンテナーが みりー氏→ りりあ になりました。)
- Rootスイッチ廃止
- マルチパートアップロードができるようになりました。 (CP-By: Misskey Tempra) (Thanks: @lqvp)
- ブロックアクティビティを送信しない設定ができるようになりました。(現状リモートのみ)
- isRoot 廃止に追従


### Client
- ウィジェットの向きを右にもできるようになりました。
- Clientが起動できない問題を修正
- 制御文字が含まれている場合にUIが破壊される問題を修正


### Server