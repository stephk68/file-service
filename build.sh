# Dans le dossier du projet
GIT_SHA=$(git rev-parse --short HEAD)
VERSION=1.0.6
REGISTRY=docker.io/dstdcie17
IMAGE_NAME=file-service
FULL_IMAGE=$REGISTRY/$IMAGE_NAME
# Build multi-tags
docker build -t $FULL_IMAGE:$VERSION -t $FULL_IMAGE:${VERSION}-$GIT_SHA -t $FULL_IMAGE:latest .