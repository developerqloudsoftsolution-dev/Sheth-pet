# Hostinger Deployment Guide for Sheth PET MERN Stack Application

This guide explains how to deploy this application to **Hostinger** and enable automated deployment through **GitHub**.

---

## Architecture Overview

- **Frontend**: React + Vite (configured to build directly into `backend/dist`)
- **Backend**: Node.js + Express (serves API at `/api` and frontend static files from `backend/dist`)
- **Database**: MongoDB Atlas (Cloud)
- **Process Manager**: PM2 (`ecosystem.config.cjs`)
- **CI/CD**: GitHub Actions (`.github/workflows/deploy.yml`)

---

## Step 1: Database Setup (MongoDB Atlas)

Since Hostinger does not provide a local MongoDB service, use a free or paid **MongoDB Atlas** cluster:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and log in.
2. Create a free cluster (M0) or use an existing one.
3. Under **Database Access**, create a user with a secure password.
4. Under **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)** so Hostinger can connect.
5. Click **Connect** → **Drivers** (Node.js) and copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/sheth?retryWrites=true&w=majority
   ```

---

## Step 2: One-Time Server Setup on Hostinger

### Option A: Hostinger VPS (Recommended for MERN)

1. Connect to your VPS via SSH from your computer terminal:
   ```bash
   ssh root@YOUR_SERVER_IP
   ```

2. Update packages and install Node.js 20, Git, and PM2:
   ```bash
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs git
   sudo npm install -g pm2
   ```

3. Clone your GitHub repository:
   ```bash
   cd ~
   git clone https://github.com/developerqloudsoftsolution-dev/Sheth-pet.git sheth-pet
   cd sheth-pet
   ```

4. Create the production `.env` file in the backend directory:
   ```bash
   nano backend/.env
   ```
   Paste the following (fill in your real credentials):
   ```env
   PORT=5000
   NODE_ENV=production
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/sheth?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key
   ADMIN_PASSWORD=YourSecurePassword
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=officeshethpet@gmail.com
   SMTP_PASS=your_email_app_password
   CLOUDINARY_CLOUD_NAME=p2ccdclk
   CLOUDINARY_API_KEY=489413488493971
   CLOUDINARY_API_SECRET=11kVESE5xD2-TlqbhB1oj6nFAbY
   ```
   Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

5. Build the application and start with PM2:
   ```bash
   npm run build
   pm2 start ecosystem.config.cjs
   pm2 startup
   pm2 save
   ```

---

## Step 3: Configure Domain & SSL (Nginx Reverse Proxy)

If you have a domain pointing to your Hostinger VPS:

1. Install Nginx and Certbot:
   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx
   ```

2. Configure Nginx:
   ```bash
   sudo nano /etc/nginx/sites-available/shethpet
   ```
   Paste:
   ```nginx
   server {
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

3. Enable configuration and reload Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/shethpet /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. Obtain a free SSL certificate:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

---

## Step 4: Setup GitHub Actions Automated Deployment

Every time you push changes to `main`, GitHub Actions will automatically SSH into Hostinger, pull code, rebuild frontend, and reload the server without downtime.

### 1. Generate SSH Key on your Server (or locally)
Run on your Hostinger server:
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_deploy
```
Copy the full private key output (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`).

### 2. Add Secrets to GitHub
1. In your GitHub repository: Go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
2. Add the following secrets:
   - `HOSTINGER_HOST`: Your server IP (e.g. `123.45.67.89`)
   - `HOSTINGER_USERNAME`: Your SSH username (e.g. `root`)
   - `HOSTINGER_SSH_KEY`: The private key copied above
   - `HOSTINGER_PORT`: SSH port (usually `22`, or custom port)
   - `HOSTINGER_TARGET_DIR`: `/root/sheth-pet` (path where repository is cloned)

Once added, pushing to the `main` branch will automatically deploy your application!

---

## Step 5: Verification & Maintenance

- **View Live Logs**:
  ```bash
  pm2 logs sheth-pet-app
  ```
- **Restart App Manually**:
  ```bash
  pm2 restart sheth-pet-app
  ```
- **Check Status**:
  ```bash
  pm2 status
  ```

