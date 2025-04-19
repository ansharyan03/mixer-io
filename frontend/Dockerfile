FROM --platform=linux/amd64 node:current-alpine
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

WORKDIR /app
COPY ./src ./src
# COPY ./src/** ./src/
COPY ./public ./public
COPY ./lib ./lib
COPY ./components ./components
COPY ./utils ./utils
COPY *.* .

RUN npm install
RUN npm run build

EXPOSE 80
CMD ["npm", "run", "start"]