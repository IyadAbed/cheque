FROM node:22 as build

WORKDIR /banck/bank-cheque
COPY ./package.json ./
RUN npm install --force
COPY . ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /banck/bank-cheque/dist/cheques /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
