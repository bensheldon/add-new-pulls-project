# Use the latest version of Node.js
#
# You may prefer the full image:
# FROM node
#
# or even an alpine image (a smaller, faster, less-feature-complete image):
# FROM node:alpine
#
# You can specify a version:
# FROM node:10-slim
FROM node:alpine

# Labels for GitHub to read your action
LABEL "com.github.actions.name"="Add new pull requests to project"
LABEL "com.github.actions.description"="✨ Magically add new pull requests to projects"
LABEL "com.github.actions.icon"="plus"
LABEL "com.github.actions.color"="green"
LABEL "repository"="https://github.com/alex-page/add-new-pulls-project"
LABEL "homepage"="https://github.com/alex-page/add-new-pulls-project"
LABEL "maintainer"="Alex Page <alex@alexpage.com.au>".

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of your action's code
COPY . .

# Run `node /index.js`
ENTRYPOINT ["node", "/index.js"]
