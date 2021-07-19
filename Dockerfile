# Dockerfile
FROM node:16
# 14 LTS

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package.json ./
COPY yarn.lock ./
COPY scripts ./scripts
COPY utils ./utils
RUN mkdir ./h5p
RUN yarn install --frozen-lockfile --non-interactive --ignore-optional

COPY --chown=node:node . .
RUN mkdir /home/node/certs

CMD ["sh", "-c", "yarn && yarn start"]

EXPOSE 8080
