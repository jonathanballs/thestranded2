FROM node:9-alpine

WORKDIR /worker
ADD package.json .
RUN yarn install
ADD . /worker/

RUN yarn run build

CMD ["yarn", "start"]

