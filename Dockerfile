FROM node:10

WORKDIR /worker
ADD package.json .
RUN yarn install
ADD . /worker/

RUN yarn run build

CMD ["yarn", "start"]

