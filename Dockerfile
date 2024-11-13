FROM node:22 as build

WORKDIR /app/cheque
COPY ./package.json ./
RUN npm install --force
COPY . ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/cheque/dist/cheques/browser /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
