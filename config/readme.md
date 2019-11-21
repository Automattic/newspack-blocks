# Build Config

Is a JSON file that configures the build system.

## Options

Currently only a single option is implemented — filter of blocks to be included in a build. 

### `blocks`

Configure it as an array of strings, where strings correspond to directory names of blocks in src/blocks/.

## Example config

```json
{
    "blocks": [ "donate" ]
}
```
