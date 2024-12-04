FROM node:20-alpine
LABEL authors="jombi"

COPY dist ./
COPY node_modules ./node_modules

EXPOSE 3336

ENTRYPOINT ["node", "main.js"]