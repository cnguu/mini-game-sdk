# Mini Game SDK

Multi-platform mini-game SDK development template.

## Platform Documents

- [Wechat](https://developers.weixin.qq.com/doc/)
- [Bytedance](https://microapp.bytedance.com/)
- [Vivo](https://minigame.vivo.com.cn/)

## Installing dependencies

```shell
$ pnpm i
```

## Build SDK

```shell
yarn build\
--platform wechat\
--domain https://api.test.com\
--app_id 12345\
--app_key 96597454-2512-4e33-b5aa-de46815357f3\
--xor_key c5vSehfv6TvR6UvGZSMRZX5siUwnoTEJ6Mo9tkYjEincnmeh\
--token_key 28ba79e5-7376-4cfa-9001-d542aed910df
--slogan "This game requires no download, click and play!"\
--share_img_url "https://res.test.com/minigame/image/minigame-123456-share.jpg"
```

- \*platform
  - values：wechat | bytedance | vivo
- \*domain
- \*app_id
- \*app_key
- \*xor_key
- \*token_key
- \*slogan
- \*share_img_url

## SDK usage

> Note：All authentication operations must be server-side authentication, and `key` is strictly prohibited to be stored in the client

### Server-side interface return data format

```text
{
  "code": number,
  "msg": string,
  "data": string | object,
}
```
