# 3-Tier Web Application Deployment with CI/CD Pipeline on AWS

> A production-style DevOps project demonstrating end-to-end automation — from source code to live cloud deployment using Docker, Jenkins, Kubernetes and Terraform on AWS EC2.

---

## 📌 Project Overview

This project implements a complete **3-Tier Web Application** deployed on **AWS EC2** using a fully automated **CI/CD pipeline**. Every component is containerized using Docker and orchestrated with Kubernetes. Infrastructure is provisioned using Terraform following Infrastructure as Code (IaC) principles.

| Layer | Technology | Purpose |
|---|---|---|
| Tier 1 | Nginx | Frontend web server and reverse proxy |
| Tier 2 | Node.js + Express | REST API backend |
| Tier 3 | MariaDB | Relational database |

---

## 🛠 Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Linux (Ubuntu) | 22.04 | Server OS and shell scripting |
| Docker | Latest | Containerization of all 3 tiers |
| Docker Compose | v2 | Multi-container local orchestration |
| Jenkins | LTS | CI/CD pipeline automation |
| Kubernetes (Minikube) | v1.38 | Container orchestration |
| Terraform | Latest | Infrastructure as Code |
| AWS EC2 | t2.micro | Cloud server (Free Tier) |
| Nginx | Alpine | Frontend server and reverse proxy |
| MariaDB | 10.6 | Managed relational database |
| GitHub | - | Source control and webhook trigger |

---

## 🏗 Architecture

```
Developer (Linux)
      │
      │  git push
      ▼
   GitHub
      │
      │  webhook trigger
      ▼
   Jenkins CI/CD Pipeline
      ├── Stage 1: Clone Code
      ├── Stage 2: Cleanup old containers
      ├── Stage 3: Docker Build (3 images)
      ├── Stage 4: Stop old containers
      └── Stage 5: Deploy (docker-compose up)
      │
      │  deploy
      ▼
┌─────────────────────────────────┐
│         Docker Containers        │
│  ┌──────────┐  ┌──────────┐    │
│  │  Nginx   │  │ Node.js  │    │
│  │ Tier 1   │─▶│ Tier 2   │    │
│  └──────────┘  └──────────┘    │
│                      │          │
│               ┌──────────┐     │
│               │  MariaDB │     │
│               │  Tier 3  │     │
│               └──────────┘     │
└─────────────────────────────────┘
      │
      │  kubectl apply
      ▼
┌─────────────────────────────────┐
│         Kubernetes Cluster       │
│  Frontend Pods  (3 replicas)    │
│  Backend Pods   (3 replicas)    │
│  Database Pods  (3 replicas)    │
│         Total: 9 Pods           │
└─────────────────────────────────┘
      │
      │  terraform apply
      ▼
   AWS EC2 (t2.micro)
   Public IP — App is LIVE
```

---

## 📁 Project Structure

```
3tier-devops-pipeline-aws/
├── frontend/
│   ├── index.html          # Dashboard UI
│   ├── style.css           # Styling
│   ├── app.js              # API calls to backend
│   ├── nginx.conf          # Nginx reverse proxy config
│   └── Dockerfile          # Frontend container
├── backend/
│   ├── server.js           # Express API routes
│   ├── db.js               # MariaDB connection pool
│   ├── package.json        # Node.js dependencies
│   └── Dockerfile          # Backend container
├── k8s/
│   ├── frontend-deployment.yaml
│   ├── backend-deployment.yaml
│   └── mariadb-deployment.yaml
├── init.sql                # Database init script
├── docker-compose.yml      # Multi-container setup
├── Jenkinsfile             # CI/CD pipeline stages
└── README.md
```

---

## ⚙️ CI/CD Pipeline (Jenkinsfile)

```groovy
pipeline {
  agent any

  stages {

    stage('Clone Code') {
      steps {
        git branch: 'main',
            url: 'https://github.com/PrathameshDangore/3tier-Project.git'
      }
    }

    stage('Cleanup') {
      steps {
        sh '''
          docker rm -f mariadb frontend backend || true
          docker network prune -f || true
        '''
      }
    }

    stage('Build Docker Images') {
      steps {
        sh 'cd $WORKSPACE && docker-compose build'
      }
    }

    stage('Stop Old Containers') {
      steps {
        sh 'cd $WORKSPACE && docker-compose down || true'
      }
    }

    stage('Deploy') {
      steps {
        sh 'cd $WORKSPACE && docker-compose up -d'
      }
    }

  }

  post {
    success { echo 'Deployment Successful!' }
    failure { echo 'Deployment Failed!' }
  }
}
```

---

## 🐳 Docker Setup

### Dockerfile — Backend

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### Dockerfile — Frontend

```dockerfile
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
COPY style.css  /usr/share/nginx/html/style.css
COPY app.js     /usr/share/nginx/html/app.js
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### docker-compose.yml

```yaml
version: "3.8"

services:

  mariadb:
    image: mariadb:10.6
    container_name: mariadb
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: appdb
    volumes:
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"

  backend:
    build: ./backend
    container_name: backend
    ports:
      - "3000:3000"
    environment:
      DB_HOST: mariadb
      DB_USER: root
      DB_PASS: secret
      DB_NAME: appdb
    depends_on:
      - mariadb

  frontend:
    build: ./frontend
    container_name: frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

---

## ☸️ Kubernetes Deployment

### frontend-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: 3tier-devops-project-frontend:latest
        imagePullPolicy: Never
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  type: NodePort
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30080
```

### backend-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: 3tier-devops-project-backend:latest
        imagePullPolicy: Never
        env:
        - name: DB_HOST
          value: "mariadb"
        - name: DB_USER
          value: "root"
        - name: DB_PASS
          value: "secret"
        - name: DB_NAME
          value: "appdb"
        ports:
        - containerPort: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  selector:
    app: backend
  ports:
  - port: 3000
    targetPort: 3000
```

### mariadb-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mariadb
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mariadb
  template:
    metadata:
      labels:
        app: mariadb
    spec:
      containers:
      - name: mariadb
        image: mariadb:10.6
        env:
        - name: MYSQL_ROOT_PASSWORD
          value: "secret"
        - name: MYSQL_DATABASE
          value: "appdb"
        ports:
        - containerPort: 3306
---
apiVersion: v1
kind: Service
metadata:
  name: mariadb
spec:
  selector:
    app: mariadb
  ports:
  - port: 3306
    targetPort: 3306
```

### Deploy all manifests

```bash
kubectl apply -f k8s/mariadb-deployment.yaml --validate=false
kubectl apply -f k8s/backend-deployment.yaml  --validate=false
kubectl apply -f k8s/frontend-deployment.yaml --validate=false
```

### Verify pods are running

```bash
kubectl get pods
kubectl get services
```

### Expected output

```
NAME                        READY   STATUS    RESTARTS
frontend-xxx                1/1     Running   0
frontend-xxx                1/1     Running   0
frontend-xxx                1/1     Running   0
backend-xxx                 1/1     Running   0
backend-xxx                 1/1     Running   0
backend-xxx                 1/1     Running   0
mariadb-xxx                 1/1     Running   0
mariadb-xxx                 1/1     Running   0
mariadb-xxx                 1/1     Running   0
```

### Access the app via Minikube

```bash
kubectl port-forward service/frontend 8081:80 --address 0.0.0.0 &
```

Open browser:
```
http://<EC2-PUBLIC-IP>:8081
```

---

## 🏗 Terraform — Infrastructure as Code

```hcl
provider "aws" {
  region = "ap-south-1"
}

resource "aws_instance" "devops_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  tags = {
    Name = "3tier-devops-server"
  }
}
```

### Commands

```bash
terraform init      # Download AWS provider plugins
terraform plan      # Preview infrastructure changes
terraform apply     # Create infrastructure on AWS
terraform destroy   # Destroy infrastructure (avoid charges)
```

---

## 🚀 How to Run This Project

### Step 1 — Clone the repository

```bash
git clone https://github.com/PrathameshDangore/3tier-Project.git
cd 3tier-Project
```

### Step 2 — Run with Docker Compose

```bash
docker compose up --build
```

### Step 3 — Open in browser

```
http://localhost
```

### Step 4 — Run Jenkins Pipeline

```bash
# Start Jenkins container
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts

# Open Jenkins
http://<EC2-PUBLIC-IP>:8080
```

### Step 5 — Deploy on Kubernetes

```bash
minikube start --driver=docker --force --memory=1800mb
kubectl apply -f k8s/
kubectl get pods
```

---

## 🐛 Common Issues and Fixes

| Issue | Cause | Fix |
|---|---|---|
| `permission denied docker.sock` | Jenkins lacks Docker permission | `chmod 777 /var/run/docker.sock` |
| `backend folder not found` | Capital letter in folder name | `mv Backend backend` |
| `kubectl pointing to Jenkins` | Wrong kubeconfig context | `kubectl config use-context minikube` |
| `no space left on device` | EC2 disk full | Increase EBS volume in AWS Console |
| `container name already in use` | Old container not removed | `docker rm -f mariadb frontend backend` |

---

## 📊 What I Learned

- Docker is not just about containers — it is about consistency across environments
- CI/CD is not optional — manual deployments are slow and error prone
- Kubernetes maintains desired state — if a pod crashes it automatically restarts
- Linux terminal is the foundation of all DevOps work
- Case sensitivity matters — `Backend` vs `backend` broke my entire Jenkins pipeline
- Terraform makes infrastructure repeatable, trackable and consistent

---
