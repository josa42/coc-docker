# coc-docker

Docker language server extension using [`dockerfile-language-server-nodejs`](https://github.com/rcjsuen/dockerfile-language-server-nodejs)
for [`coc.nvim`](https://github.com/neoclide/coc.nvim).

## Install

In your vim/neovim, run command:

    :CocInstall coc-docker

## Features

See [`dockerfile-language-server-nodejs`](https://github.com/rcjsuen/dockerfile-language-server-nodejs)

## Configuration options

- `docker.enable` set to `false` to disable language server.

Trigger completion in `coc-settings.json` to get complete list.

## Development

1. Run `yarn build` or `yarn build:watch`
2. Link extension

```sh
cd ~/github/coc-docker      && yarn link
cd ~/.config/coc/extensions && yarn link coc-docker
```

3. Add `"coc-docker": "*"` to dependencies in `~/.config/coc/extensions/package.json`

## License

[MIT © Josa Gesell](LICENSE)
