FROM slocomptech/bi-node:12 as builder

COPY package.json /app/

RUN apk add --no-cache --virtual .build-dependencies \
			autoconf \
			automake \
			build-base \
			cmake \
			gcc \
			g++ \
			make \
			musl-dev \
			python3 && \
		ln -s /usr/bin/python3 /usr/bin/python && \
		cd /app && \
		sudo -u ${CONTAINER_USER} -g ${CONTAINER_USER} npm install ${NPM_ARGS}

FROM slocomptech/bi-node:12

#
#	Copy packages from builder
#
COPY --from=builder /app/node_modules /app/node_modules

# Install dependencies
RUN apk add --no-cache docker && \
  echo "${CONTAINER_USER} ALL=(ALL) NOPASSWD: $(which docker)" >> /etc/sudoers.d/${CONTAINER_USER}

#
#	Arguments
#
ARG BUILD_DATE
ARG NODE_ENV
ARG NPM_ARGS
ARG VCS_REF
ARG VCS_SRC
ARG VERSION

#
#	Labels
#	@see https://github.com/opencontainers/image-spec/blob/master/annotations.md
#	@see https://semver.org/
#
LABEL maintainer="martin.dagarin@gmail.com" \
	org.opencontainers.image.authors="Martin Dagarin" \
	org.opencontainers.image.created=${BUILD_DATE} \
	org.opencontainers.image.description="Portainer deployer" \
	org.opencontainers.image.documentation="https://github.com/SloCompTech/portainer-deployer" \
	org.opencontainers.image.revision=${VCS_REF} \
	org.opencontainers.image.source=${VCS_SRC} \
	org.opencontainers.image.title="Portainer Deployer" \
	org.opencontainers.image.url="https://github.com/SloCompTech/portainer-deployer"\
	org.opencontainers.image.vendor="Martin Dagarin" \
	org.opencontainers.image.version=${VERSION}

#
#	Environment variables
#	Don't forget to set NODE_ENV
#	@see https://github.com/remy/nodemon/blob/master/bin/postinstall.js (bugfix when installing nodemon)
#
ENV APP_VERSION=${VERSION} \
		IN_DOCKER=true \
		NODE_ENV=${NODE_ENV}

#
# s6 overlay scripts
#	@see https://github.com/just-containers/s6-overlay
#
COPY root /

# App directory
COPY . /app/

# Fix file permissions
RUN chown -R $CONTAINER_USER:$CONTAINER_USER /app && \
		chown -R $CONTAINER_USER:$CONTAINER_USER /defaults 

