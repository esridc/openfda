# Koop Docker for Open FDA

> Application using [Koop](https://github.com/esri/koop) and [Koop-FDA](../koop-fda) with [Docker](https://www.docker.com/).

## Setting up Docker

### OSX

Grab docker, docker-machine, and docker-compose.

```
curl -L https://get.docker.com/builds/Darwin/x86_64/docker-latest > docker
curl -L https://github.com/docker/machine/releases/download/v0.2.0/docker-machine_darwin-amd64 > docker-machine
curl -L https://github.com/docker/compose/releases/download/1.2.0/docker-compose-`uname -s`-`uname -m` > docker-compose

chmod +x docker*
mv docker* /usr/local/bin/
```

```
docker-machine create --driver virtualbox dev
```

Evaluate the docker environment variables for your shell.

```
eval "$(docker-machine env dev)"
```

## Setting up Koop and PostGIS

Change directory to koop-docker

```
cd koop-docker
```

### Editing environmentalv variables

Copy docker-compose.yml.example to docker-compose.yml

```
cp docker-compose.yml.example docker-compose.yml
```

Edit the docker-compose.yml file and add in your [API Key](https://open.fda.gov/api/reference/#your-api-key)

### PostGIS

Start up the PostGIS container using `docker-compose`.

```
docker-compose up -d postgis
```

Start the koop server.

```
docker-compose up --no-deps koopPG
```

You can test that everything's working fine with a simple curl. Or checkout what you can do with the [FDA provider](../koop-fda/README.md)

```
curl -XGET '192.168.204.178:8002/status'
```

Note: If this doesn't work, check to address of your Docker host and take the IP address from the DOCKER_HOST env variable
``` 
docker-machine env                                                                                                                                          [11:25:24]
export DOCKER_TLS_VERIFY=1
export DOCKER_CERT_PATH="/Users/dev/.docker/machine/machines/dev"
export DOCKER_HOST=tcp://192.168.204.178:2376

# Run this command to configure your shell: eval "$(docker-machine env)"
```

## Contributing

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/Esri/contributing).

## License

[Apache-2.0](LICENSE.md)
