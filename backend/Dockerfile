FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# NOTE: dev dependencies are kept on purpose — the entrypoint runs drizzle-kit
# to sync the database schema on every start.
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Entrypoint syncs the schema (drizzle-kit push) before handing off to CMD
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 5030

# Start server
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "start"]
