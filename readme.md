CSV-to-Separate-JSON
===

What this do
---

Transform csv file:

```text
id, en, zh
hello, Hello, 你好
world, World, 世界
```

to separate files:

[en.json]

```json
{
  "hello": "Hello",
  "word": "World"
}
```

[zh.json]

```json
{
  "hello": "你好",
  "word": "世界"
}
```

Usage
---

npm run start file [...otherFiles]

| Short | Full            | Args         | Description        | Default          |
|:-----:|:---------------:|:------------:|:------------------:|:----------------:|
| -k    | --key           | [column key] | Key column         | `id`             |
| -d    | --destination   | [folder]     | Destination folder | `./dist`         |
| -s    | --seperator     | [delimeter]  | Column Seperator   | `,`              |
| -i    | --ignoreColumns | [string,...] | Ignore Columns     | `(null)`         |
