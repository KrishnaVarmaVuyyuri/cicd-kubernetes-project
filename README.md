# CI/CD Pipeline with GitHub Actions, Docker & Kubernetes


A complete DevOps CI/CD project that automates application testing, Docker image creation, Docker Hub publishing, and Kubernetes deployment using GitHub Actions.


## Architecture


```text
                         Developer
                             |
                             | git push
                             v
                         GitHub
                             |
                             v
                    GitHub Actions
                             |
                    +--------+--------+
                    |                 |
                    v                 v
               Run Tests        Build Docker Image
                    |                 |
                    |                 v
                    |            Docker Hub
                    |                 |
                    +--------+--------+
                             |
                             v
                   Self-Hosted Runner
                             |
                             v
                       Kubernetes
                        (Minikube)
                             |
                             v
                       Deployment
                             |
                    RollingUpdate
                             |
                             v
                           Pod
                     +-------+-------+
                     |               |
                     v               v
                Readiness        Liveness
                   Probe            Probe
                     |               |
                     +-------+-------+
                             |
                             v
                       Node.js App
Project Overview

This project demonstrates an automated CI/CD pipeline for deploying a containerized Node.js application to Kubernetes.

Whenever code is pushed to the main branch:

GitHub Actions checks out the source code.
Node.js dependencies are installed.
Automated tests are executed.
A Docker image is built.
The image is tagged using the Git commit SHA.
The image is pushed to Docker Hub.
A self-hosted GitHub Actions runner connects to the local Kubernetes cluster.
Kubernetes manifests are applied.
The Deployment is updated with the new Docker image.
Kubernetes performs a rolling update.
Readiness and liveness probes monitor application health.
GitHub Actions verifies the deployment rollout.
Technologies Used
Git
GitHub
GitHub Actions
Docker
Docker Hub
Kubernetes
Minikube
kubectl
YAML
Node.js
npm
Project Structure
cicd-kubernetes-project/
|
├── .github/
│   └── workflows/
│       └── ci.yml
|
├── k8s/
│   ├── namespace.yaml
│   ├── deployment.yaml
│   └── service.yaml
|
├── src/
│   └── ...
|
├── tests/
│   └── ...
|
├── Dockerfile
├── .dockerignore
├── package.json
├── package-lock.json
└── README.md
CI/CD Pipeline

The pipeline contains three major stages.

1. Continuous Integration
Git Push
   |
   v
Checkout Code
   |
   v
Install Dependencies
   |
   v
Run Tests

If tests fail, the Docker image is not built or deployed.

2. Docker Build and Push
Successful Tests
      |
      v
Docker Build
      |
      v
Git Commit SHA Tag
      |
      v
Docker Hub

Docker images are tagged using the Git commit SHA.

Example:

krishnavarmavuyyuri/cicd-kubernetes-app:0017d3b

This allows each Docker image to be traced back to a specific source-code version.

3. Kubernetes Deployment
Docker Hub
     |
     v
Self-Hosted Runner
     |
     v
kubectl
     |
     v
Kubernetes Deployment
     |
     v
Rolling Update

The deployment uses the exact Docker image generated from the Git commit.

Docker

The application is containerized using Docker.

The Docker image:

Uses Node.js Alpine
Installs production dependencies using npm ci --omit=dev
Uses Docker layer caching
Runs the application as the non-root node user
Exposes port 3000

Build locally:

docker build -t cicd-kubernetes-app:local .

Run:

docker run -d \
  --name cicd-local-test \
  -p 3000:3000 \
  cicd-kubernetes-app:local

Test:

curl http://localhost:3000/health

Verify the container user:

docker exec cicd-local-test whoami

Expected:

node
Kubernetes

The application is deployed using three Kubernetes resources:

Namespace
cicd-demo
Deployment

The Deployment manages the application Pods.

Configuration includes:

1 replica
RollingUpdate strategy
maxUnavailable: 0
maxSurge: 1
Readiness probe
Liveness probe
CPU requests and limits
Memory requests and limits
Application environment variables
Service

A NodePort Service exposes the application:

Service Port: 80
Target Port: 3000
NodePort: 31080
Kubernetes Health Checks
Readiness Probe

The readiness probe checks:

GET /health

A Pod becomes ready only after the application responds successfully.

Pod starts
   |
   v
Readiness check
   |
   +---- failure ---> Pod not ready
   |
   +---- success ---> Pod receives traffic
Liveness Probe

The liveness probe checks whether the application remains healthy.

If the liveness check repeatedly fails, Kubernetes can restart the container.

Application
     |
     v
Liveness Probe
     |
     +---- Healthy ---> Continue running
     |
     +---- Failed ----> Container restart
Rolling Updates

The Deployment uses:

strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 0
    maxSurge: 1

This allows Kubernetes to start the new Pod before terminating the old Pod.

Old Pod
   |
   +----------------+
                    |
                    v
               New Pod
                    |
               Readiness OK
                    |
                    v
              Old Pod removed
Local Kubernetes Setup

Start Minikube:

minikube start --driver=docker --memory=1800 --cpus=2

Verify:

minikube status

Check the cluster:

kubectl get nodes

Expected:

minikube   Ready
Deploy Manually

Apply the Kubernetes resources:

kubectl apply -f k8s/

Check resources:

kubectl get all -n cicd-demo

Check Pods:

kubectl get pods -n cicd-demo

Check Deployment:

kubectl get deployment -n cicd-demo
Access the Application

Get the Minikube service URL:

minikube service cicd-app-service -n cicd-demo --url

Test the health endpoint:

curl http://127.0.0.1:<PORT>/health
Useful Kubernetes Commands

Check Pods:

kubectl get pods -n cicd-demo

Describe a Pod:

kubectl describe pod -n cicd-demo

Check Deployment:

kubectl get deployment cicd-app -n cicd-demo

Check rollout:

kubectl rollout status deployment/cicd-app -n cicd-demo

Check rollout history:

kubectl rollout history deployment/cicd-app -n cicd-demo

Check Service:

kubectl get service -n cicd-demo
GitHub Actions

The GitHub Actions workflow performs:

Checkout
   |
Install Dependencies
   |
Run Tests
   |
Build Docker Image
   |
Push Docker Image
   |
Deploy to Kubernetes
   |
Wait for Rollout
   |
Verify Deployment

Docker Hub credentials are stored as GitHub Actions repository secrets.

Required secrets:

DOCKERHUB_USERNAME
DOCKERHUB_TOKEN

Credentials are not stored directly in the workflow.

Self-Hosted Runner

The deployment job uses a self-hosted GitHub Actions runner because the Kubernetes cluster is running locally through Minikube.

Architecture:

GitHub
   |
   v
GitHub Actions
   |
   v
Self-Hosted Runner
   |
   +---- kubectl
   |
   +---- Minikube
   |
   v
Kubernetes

This allows the deployment workflow to communicate with the local Kubernetes API server.

Image Versioning

Docker images are tagged using the Git commit SHA.

Example:

Git Commit
    |
    v
0017d3b
    |
    v
Docker Image
    |
    v
cicd-kubernetes-app:0017d3b

This provides traceability between:

Git Commit
    |
Docker Image
    |
Kubernetes Deployment
Security Practices

This project follows several basic container security practices:

Docker Hub credentials stored in GitHub Secrets
No credentials hardcoded in source code
Docker container runs as a non-root user
Production-only npm dependencies installed
.dockerignore prevents unnecessary files from entering the image
Kubernetes resource limits prevent excessive resource consumption
Troubleshooting
Check Minikube
minikube status
Check Kubernetes nodes
kubectl get nodes
Check application Pods
kubectl get pods -n cicd-demo
Check Pod logs
kubectl logs -n cicd-demo <pod-name>
Check Pod events
kubectl describe pod -n cicd-demo <pod-name>
Check rollout
kubectl rollout status deployment/cicd-app -n cicd-demo
Skills Demonstrated

This project demonstrates practical experience with:

Linux
Git
GitHub
GitHub Actions
CI/CD
Docker
Docker Hub
Dockerfile optimization
Kubernetes
Kubernetes Deployments
Kubernetes Services
Kubernetes Namespaces
Kubernetes Probes
Kubernetes Rolling Updates
kubectl
YAML
Container security
Infrastructure automation
Deployment verification
