# portainer-deployer

NodeJS application that deploys/updates portainer stack with new version of containers.

## Usage

``` bash
export PORTAINER_API="http://localhost:9000/api"

# Development
npm run start:dev

# Production
npm run start

# Development run commands
DISABLE_AUTH=1 PORTAINER_API=http://localhost:9000/api npm run start:dev
PORTAINER_API=http://localhost:9000/api npm run start:dev
```

## Docker

### Build

``` bash
docker build -t <tag> .
```

### Run

``` bash
docker create \
  --name=deployer \
  -e PORTAINER_API="http://localhost:9000/api" \
  -e TZ=Europe/Ljubljana \
  -p 3000:3000 \
  --restart unless-stopped \
  slocomptech/portainer-deployer
```

### Docker compose

``` yaml
version: "2"
services:
  portainer-deployer:
    image: slocomptech/portainer-deployer
    container_name: portainer-deployer
    environment:
      - PORTAINER_API="http://localhost:9000/api"
      - FREQUENCY=173.250M
      - TZ=Europe/Ljubljana
    ports:
      - "3000:3000"
    restart: unless-stopped
```

### Parameters

|Parameter|Function|
|:-------:|:-------|
| `-e DISABLE_AUTH=true` | Disable authentication |
| `-e PORTAINER_API=http(s)://<url>/api` | Portainer API URL (required) |
| `-e PORTAINER_USER=<username>` | Portainer (default) username |
| `-e PORTAINER_PASS=<password>` | Portainer (default) password |
| `-e CONFIG=<path to config file>` | Custom config file path. |
| `-e LOG_LEVEL=verbose` | Enable app output see [docs](https://www.npmjs.com/package/winston#logging)|
| `-e FAIL_MODE=hard` | What to do if services fail. |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e SKIP_APP=true` | Don't start app, useful for development. |
| `-e TZ=Europe/London` | Specify a timezone to use EG Europe/London. |
| `-v <path>:/config` | All the config files reside here. |
| `-p 3000:3000` | Expose port |

## Request

Request metod is **POST** and depends on handler, but in general request looks like

``` json
{
  "handler": "default", /* Handler name, if omitted default is 'default' */
  "data": {
    /* Data send to handler */
  }
}
```

### Authentication

Authenitcation of app is linked to portainer API login, so it hasn't any internal authentication mechanisms.
But there are multiple ways of authentication:

- Header `Authorization: Bearer <Portainer auth token>`
- Header `Authorization: Basic <base64 encoded user:pass>`
- No headers, set `PORTAINER_USER`, `PORTAINER_PASS` environment variables.

### Handlers

#### Default handler

Default handler **changes** value of **existing** *environment variables* of stack and triggers redeploy.

``` json
{
  "data": {
    "stack": "<stack name>",
    "env": {
      "<varname>": "<value>"
    }
  }
}
```
