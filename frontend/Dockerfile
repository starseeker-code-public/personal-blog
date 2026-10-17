FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_BASE=http://localhost:8000
ARG VITE_SECURE_PATH
ARG VITE_PATH_LOGIN
ARG VITE_PATH_ADMIN_NEW
ARG VITE_PATH_ADMIN_UPDATE
ARG VITE_PATH_ADMIN_DREAMS
ARG VITE_PATH_ADMIN_INFO
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_SECURE_PATH=$VITE_SECURE_PATH
ENV VITE_PATH_LOGIN=$VITE_PATH_LOGIN
ENV VITE_PATH_ADMIN_NEW=$VITE_PATH_ADMIN_NEW
ENV VITE_PATH_ADMIN_UPDATE=$VITE_PATH_ADMIN_UPDATE
ENV VITE_PATH_ADMIN_DREAMS=$VITE_PATH_ADMIN_DREAMS
ENV VITE_PATH_ADMIN_INFO=$VITE_PATH_ADMIN_INFO
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# A template: the image's entrypoint fills it in when the container starts.
COPY nginx.conf /etc/nginx/templates/default.conf.template
# Where nginx asks for crawlers' <head> (see nginx.conf): the backend the app
# calls, unless the container is given another address (docker-compose does).
ARG VITE_API_BASE=http://localhost:8000
ENV SEO_API_ORIGIN=$VITE_API_BASE
# Hand nginx the container's DNS servers, and fill in only these two variables.
ENV NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1
ENV NGINX_ENVSUBST_FILTER="^(SEO_API_ORIGIN|NGINX_LOCAL_RESOLVERS)"
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
