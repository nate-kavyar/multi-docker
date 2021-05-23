#tag the build with bulder so we can re-use the name
FROM node:alpine as builder

# where to copy files to
WORKDIR '/app'

# copy over just pakcage .json for node dependencies
COPY package.json ./

#install modules on container
RUN npm install

# copy over all the source code
COPY . .

#build the production app
RUN npm run build

# since this is not dev we will build
# a separate nginx version to host react
# built web content - a separate nginx server will
# handle main routing
FROM nginx

# this will run on port 3000 to run the react app
EXPOSE 3000

# copy over the default.conf and overwrite existing default conf on container
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# copy over the production build built above to nginx directory
# node will put the production build into the build directory of app
# (react create app defaults)
COPY --from=builder /app/build /user/share/nginx/html