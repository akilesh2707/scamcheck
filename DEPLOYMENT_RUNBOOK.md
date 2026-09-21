# ScamCheck Deployment Runbook

## 1. Prerequisites
- Docker and Docker Compose installed
- A domain name (e.g. `scamcheck.example.com`) pointed to your server
- SSL certificates (e.g., Let's Encrypt / Certbot) for HTTPS termination
- Secrets generated:
  - `JWT_SECRET` (Use `openssl rand -base64 32`)
  - `LLM_API_KEY` (OpenAI or other supported provider)

## 2. Environment Setup
Create a `.env` file in the root directory (or use a secure orchestrator secrets manager). Do **not** commit this file.

```env
# Backend/App Secrets
JWT_SECRET=your_secure_random_string
LLM_API_KEY=your_llm_api_key

# Optional Customizations (Docker Compose uses internal networking defaults for these)
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://mongodb:27017/scamcheck
REDIS_URL=redis://redis:6379
ML_SERVICE_URL=http://ml-service:8000
```

## 3. Docker Startup
1. Build and start all services:
   ```bash
   docker compose up -d --build
   ```
2. Verify all services are running and healthy:
   ```bash
   docker compose ps
   ```
   *(Ensure MongoDB, Redis, ML Service, Backend, and Frontend all report `Up (healthy)`).*

## 4. Health Verification
- **Backend:** `curl http://localhost:5001/api/ready`
- **ML Service:** `curl http://localhost:8000/docs`
- **Frontend Nginx:** `curl http://localhost:80`

## 5. Logs
View application logs across all services:
```bash
docker compose logs -f
```
Or for a specific service (e.g., backend):
```bash
docker compose logs -f backend
```

## 6. Restart Procedure
To cleanly restart the entire stack:
```bash
docker compose down
docker compose up -d
```
To restart a single service gracefully (e.g., ML Service):
```bash
docker compose restart ml-service
```

## 7. Database Backup (MongoDB)
MongoDB contains the persistent application data. It MUST be backed up.
```bash
# Run mongodump inside the container and output to host machine
docker compose exec mongodb mongodump --db scamcheck --archive > scamcheck_backup_$(date +%Y%m%d).archive
```

## 8. Database Restore (MongoDB)
To restore a backup to the MongoDB container:
```bash
cat scamcheck_backup_YYYYMMDD.archive | docker compose exec -T mongodb mongorestore --archive --drop
```

## 9. Redis Recovery & Data Loss Implications
Redis is used for transient states:
- Temporary extension pairing codes
- Rate limit tracking
- Transient cache

**Redis is NOT backed up.** 
If the Redis container is destroyed or restarted, the following operational behavior will occur:
- Active short-lived pairing codes currently awaiting exchange will become invalid.
- Users actively pairing the extension will need to click "Connect" again.
- API Rate limit counts will reset to 0.

No permanent data (Reports, Users, Profiles) will be lost.

## 10. Update/Redeploy Procedure
When pulling new code:
```bash
git pull origin main
docker compose build
docker compose up -d
```
Docker compose will only recreate the containers whose image or configuration has changed, respecting `service_healthy` conditions.

## 11. Rollback Procedure
To rollback to a previous version:
1. `git checkout <previous_commit_hash>`
2. `docker compose build`
3. `docker compose up -d`

## 12. Frontend & Extension Configuration
- **Frontend SPA**: Handled by Nginx in the `frontend` container. Nginx redirects all unknown paths to `index.html`.
- **Extension**: You must configure the production `API_URL` and `WEB_APP_URL` in the extension's `.env` (or CI environment variables) prior to building the extension `.zip` artifact for distribution.

## 13. Troubleshooting
- **Backend fails to start**: Check if `JWT_SECRET` or `LLM_API_KEY` are missing. The backend enforces `failFast()` in production and will crash if secrets are omitted.
- **Frontend routes return 404**: Verify Nginx configuration. It must include `try_files $uri /index.html;`.
- **"Network Error" in extension**: Ensure CORS is properly configured in the backend for the extension's specific origin or that the API reverse proxy supports TLS.

## 14. Security Checklist
- [ ] MongoDB and Redis ports are NOT exposed in `docker-compose.yml`.
- [ ] HTTPS (TLS) is configured on the Reverse Proxy/Ingress in front of the services.
- [ ] `JWT_SECRET` is unique, strong, and not shared.
- [ ] `NODE_ENV` is set to `production`.
