FROM node:20-alpine
LABEL authors="jombi"

COPY dist ./

EXPOSE 3336

ENTRYPOINT ["node", "main.js"]