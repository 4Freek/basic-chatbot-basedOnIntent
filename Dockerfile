# Pin specific version for stability
FROM node:19.6-alpine as base

# # 👇 you can use env variables to pin library versions
ENV TINI_VERSION="v0.19.0"

# 👇
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
# 👆

# Specify working directory other than /
WORKDIR /app

# Copy only files required to install
# dependencies (better layer cacheing)
COPY package*.json ./

# -----------------------------------------------------

FROM base as dev

RUN --mount=type=cache, target=/app/.npm \
npm set cache /app/.npm && npm install

ENTRYPOINT ["/tini", "--", "npm", "run", "dev"]

# ------------------------------------------------------

FROM base as production

#set node environment
ENV NODE_ENV production

# Install only production dependencies
# Use cache mount to speed up install of existing dependencies
RUN --mount=type=cache, target=/app/.npm \
npm set cache /app/.npm && npm ci --only=production


# Use non-root user
# Use ---chown on COPY commands to set file permissions
USER node

# Copy remaining source code AFTER installing dependencies
# Again, copy only the necesary files
COPY --chown=node:node ./src/ .


# Indicate expeceted port
EXPOSE 3000

ENTRYPOINT ["/tini", "--", "npm", "run", "start"]