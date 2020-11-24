FROM node:10

WORKDIR /worker
ADD package.json .
RUN yarn install
ADD . /worker/

RUN yarn run build

ENV PORT=80
EXPOSE 80
CMD ["yarn", "start"]

