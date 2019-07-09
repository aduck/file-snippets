# snippets

> 把常用的代码文件生成代码片段

## INSTALL

```bash
npm i file-snippets -g
```

## USAGE

```bash
Usage: snipp [options]

Options:
  -V, --version        output the version number
  -i, --input <path>   config input path
  -o, --output <path>  config output path
  -p, --prefix <name>  config prefix words, default equal inputpath basename, valid only if inputpath is a file
  -t, --title <title>  config title, default equal prefix, valid only if inputpath is a file
  -d, --desc <desc>    config description, default equal title, valid only if inputpath is a file
  -C, --no-comb        don’t combi output, valid only if input is a dir
  -c, --config <path>  set config file path
  -m, --merge <name>   merge to a json file
  -h, --help           output usage information
```

## EXAMPLE

```bash
# help
snipp -h
# single file
snipp -i ./codes/a.js -t 'a demo' -p a -d 'a descrition' -o ./snippets
# by a config file
snipp -c ./snipp-demo.config.js -o ./snippets
# by a dir
snipp -i ./codes -o ./snippets
# merge exists json file
snipp -i ./codes -m javascript -o ./snippets
snipp -i './code/a.json,./codes/b.json' -m javascript -o ./snippets
```
