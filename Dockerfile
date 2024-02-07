FROM node:20.11-alpine as install

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn*.lock ./
RUN yarn install --production=false

FROM node:20.11-alpine as build

WORKDIR /usr/src/app
COPY --from=install /usr/src/app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:20.11-alpine as prod-install

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn*.lock ./
RUN yarn install --production=true --frozen-lockfile

FROM node:20.11-alpine as prod-build

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn*.lock ./
COPY tsconfig.json ./
COPY --from=build /usr/src/app/dist ./dist
COPY --from=prod-install /usr/src/app/node_modules ./node_modules

EXPOSE 5000

CMD ["yarn", "start"]
