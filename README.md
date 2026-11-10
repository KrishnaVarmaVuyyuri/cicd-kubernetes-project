# CI/CD and GitOps Pipeline with GitHub Actions, Docker, Kubernetes & Argo CD

A hands-on DevOps project demonstrating automated application testing, Docker image creation, Docker Hub publishing, Kubernetes deployment, and GitOps-based continuous delivery using Argo CD on AWS EC2.

<img width="829" height="341" alt="Screenshot 2026-11-10 173656" src="https://github.com/user-attachments/assets/d53f89e3-e293-40b5-9ad1-bc662d00f71b" />


## Architecture

```text
                 Developer
                     |
                  Git Push
                     |
                     v
              GitHub Application Repo
                     |
                     v
              GitHub Actions (CI)
                     |
             +-------+-------+
             |               |
             v               v
          Run Tests      Build Docker Image
                             |
                             v
                         Docker Hub
                             |
                             v
                   Update GitOps Repository
                             |
                             v
                  GitHub GitOps Repository
                             |
                             v
                         Argo CD
                             |
                    Detect Git Changes
                             |
                             v
                    Kubernetes Cluster
                       (Minikube)
                             |
                             v
                      Deployment
                             |
                       RollingUpdate
                             |
                             v
                           Pod
                             |
                             v
                       Node.js App
```

## Project Overview

This project demonstrates a containerized Node.js application deployed to Kubernetes using a CI/CD and GitOps workflow.

The infrastructure runs on an AWS EC2 instance, with Minikube providing the Kubernetes environment and Argo CD managing application deployment from Git.

### Main workflow

1. Developer pushes application code to GitHub.
2. GitHub Actions checks out the source code.
3. Dependencies are installed and automated tests are executed.
4. Docker builds the application image.
5. The image is tagged and published to Docker Hub.
6. The GitOps repository stores Kubernetes manifests.
7. Argo CD monitors the GitOps repository.
8. Argo CD synchronizes the desired configuration with Kubernetes.
9. Kubernetes performs rolling updates and runs the application.

*Automated GitOps image-tag updates from GitHub Actions are the next planned integration step.*

## Technologies Used

- AWS EC2
- Ubuntu Server 24.04 LTS
- Git and GitHub
- GitHub Actions
- Docker and Docker Hub
- Kubernetes
- Minikube
- Argo CD
- kubectl
- YAML
- Node.js
- npm
- Linux
- GitOps

## AWS Infrastructure

The Kubernetes environment runs on AWS EC2.

| Configuration | Value |
|---|---|
| Instance type | M7i-flex.large |
| vCPU | 2 |
| Memory | 8 GiB |
| Operating system | Ubuntu 24.04 LTS |
| Root EBS volume | 40 GiB |
| Container runtime | Docker |
| Kubernetes distribution | Minikube |
| Minikube driver | Docker |

### Infrastructure installation

Docker is installed using the official Docker repository.

Minikube is configured using the Docker driver.

Start the cluster:

```bash
minikube start --driver=docker --cpus=2 --memory=5500
```

Verify:

```bash
minikube status
kubectl get nodes
kubectl get pods -A
```

## Docker

The Node.js application is containerized using Docker.

Docker Hub repository:

```text
krishnavarmavuyyuri/cicd-kubernetes-app
```

Example image:

```text
krishnavarmavuyyuri/cicd-kubernetes-app:1.0
```

The project uses:

- Node.js Alpine base image
- Production-only npm dependencies
- Docker layer caching
- Non-root container execution
- `.dockerignore`
- Application port 3000

Build locally:

```bash
docker build -t cicd-kubernetes-app:local .
```

Run locally:

```bash
docker run -d \
  --name cicd-local-test \
  -p 3000:3000 \
  cicd-kubernetes-app:local
```

Test:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/users
```

## Kubernetes

The application is deployed to Minikube using Kubernetes resources.

### Namespace

```text
cicd-demo
```

### Deployment

```text
cicd-app
```

Deployment configuration includes:

- One application replica
- RollingUpdate strategy
- maxUnavailable: 0
- maxSurge: 1
- Readiness probe
- Liveness probe
- CPU and memory requests
- CPU and memory limits
- Application port 3000

### Service

```text
cicd-app-service
```

| Configuration | Value |
|---|---|
| Type | NodePort |
| Service port | 80 |
| Target port | 3000 |
| NodePort | Dynamically assigned |

### Useful commands

```bash
kubectl get pods -n cicd-demo
kubectl get deployments -n cicd-demo
kubectl get services -n cicd-demo
kubectl get endpoints -n cicd-demo
```

## Argo CD and GitOps

Argo CD is installed inside the Kubernetes cluster in a dedicated namespace.

### Argo CD namespace

```text
argocd
```

### GitOps repository

Repository:

https://github.com/KrishnaVarmaVuyyuri/cicd-kubernetes-gitops

The GitOps repository contains:

```text
cicd-kubernetes-gitops/
|
├── deployment.yaml
├── namespace.yaml
├── service.yaml
└── README.md
```

### Argo CD Application

Application name:

```text
cicd-app-gitops
```

Configuration:

| Setting | Value |
|---|---|
| Repository | cicd-kubernetes-gitops |
| Branch | master |
| Path | . |
| Destination cluster | https://kubernetes.default.svc |
| Destination namespace | cicd-demo |
| Sync policy | Automatic |
| Self Heal | Enabled |
| Prune | Enabled |

### How GitOps works

Argo CD continuously monitors the GitOps repository.

It compares:

- Desired state: Kubernetes manifests stored in Git.
- Actual state: Resources currently running in Kubernetes.

When the Git configuration changes, Argo CD detects the difference and synchronizes the cluster according to the configured sync policy.

### Useful Argo CD commands

Check Argo CD pods:

```bash
kubectl get pods -n argocd
```

Check services:

```bash
kubectl get svc -n argocd
```

Retrieve the initial admin password:

```bash
kubectl get secret argocd-initial-admin-secret \
  -n argocd \
  -o jsonpath="{.data.password}" | base64 -d
```

## Accessing Argo CD UI from Windows

The Argo CD dashboard is accessed securely using SSH local port forwarding.

On the EC2 instance:

```bash
kubectl get svc argocd-server -n argocd
```

The Argo CD service uses NodePort.

From Windows PowerShell:

```powershell
ssh -i "your-key.pem" `
-L 8443:192.168.49.2:31146 `
ubuntu@YOUR_EC2_PUBLIC_IP
```

Open:

```text
https://localhost:8443
```

The SSH connection must remain active while accessing the dashboard.

## Accessing the Node.js Application from Windows

The application runs inside a Kubernetes Pod.

Start port forwarding on EC2:

```bash
kubectl port-forward \
  svc/cicd-app-service \
  -n cicd-demo 3000:80
```

From Windows PowerShell:

```powershell
ssh -i "your-key.pem" `
-L 3000:localhost:3000 `
ubuntu@YOUR_EC2_PUBLIC_IP
```

Open:

```text
http://localhost:3000
```

Application endpoints:

```text
http://localhost:3000/health
http://localhost:3000/api/users
```

## GitHub Actions CI

The application repository uses GitHub Actions for continuous integration.

The CI workflow performs:

1. Checkout source code.
2. Install Node.js dependencies.
3. Run automated tests.
4. Build Docker image.
5. Tag the image using the Git commit SHA.
6. Push the image to Docker Hub.

Docker Hub credentials are stored as GitHub repository secrets.

Required secrets:

```text
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
```

Credentials are not stored directly in workflow files.

## GitOps Delivery Workflow

The GitOps repository is the source of truth for Kubernetes deployment configuration.

The intended complete delivery flow is:

```text
Application Code Push
        |
        v
GitHub Actions CI
        |
        v
Run Tests
        |
        v
Build Docker Image
        |
        v
Push to Docker Hub
        |
        v
Update Image Tag in GitOps Repository
        |
        v
Argo CD Detects Git Change
        |
        v
Synchronize Kubernetes
        |
        v
New Application Version Running
```

The automated GitOps image-tag update is a planned next integration.

## Kubernetes Health Checks

### Readiness Probe

The readiness probe checks:

```text
GET /health
```

A Pod receives application traffic only when it is ready.

### Liveness Probe

The liveness probe checks whether the application remains healthy.

If the liveness check repeatedly fails, Kubernetes can restart the container.

## Rolling Updates

The Deployment uses:

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 0
    maxSurge: 1
```

This allows Kubernetes to start a new Pod before removing the old Pod, subject to available cluster resources and successful readiness checks.

Check rollout:

```bash
kubectl rollout status deployment/cicd-app -n cicd-demo
```

## Security Practices

- Docker Hub credentials stored in GitHub Secrets.
- No credentials hardcoded in source code.
- Docker container runs as a non-root user.
- Production-only npm dependencies.
- Kubernetes resource requests and limits.
- EC2 SSH access restricted through security groups.
- Argo CD dashboard accessed through SSH port forwarding.
- No publicly exposed Kubernetes API or dashboard ports.

## Troubleshooting

Check Minikube:

```bash
minikube status
```

Check Kubernetes nodes:

```bash
kubectl get nodes
```

Check Argo CD:

```bash
kubectl get pods -n argocd
```

Check application Pods:

```bash
kubectl get pods -n cicd-demo
```

Check Pod logs:

```bash
kubectl logs -n cicd-demo <pod-name>
```

Describe a Pod:

```bash
kubectl describe pod -n cicd-demo <pod-name>
```

Check rollout:

```bash
kubectl rollout status deployment/cicd-app -n cicd-demo
```

Check Argo CD Application:

```bash
kubectl get applications -n argocd
```

Check disk space:

```bash
df -h
```

## Skills Demonstrated

- Linux administration
- AWS EC2 infrastructure
- Docker containerization
- Docker Hub image publishing
- GitHub Actions CI pipelines
- Kubernetes Deployments and Services
- Minikube cluster management
- Argo CD
- GitOps principles
- Kubernetes health probes
- Rolling updates
- Resource management
- YAML configuration
- SSH port forwarding
- Container security
- Infrastructure troubleshooting

---

**Project:** CI/CD and GitOps Pipeline with GitHub Actions, Docker, Kubernetes and Argo CD.
