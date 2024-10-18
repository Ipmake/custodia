# Create a new builder instance
docker buildx create --name custodiabuilder --use

# Build and push the amd64 image
docker buildx build --platform linux/amd64 -t ipmake/custodia:latest-amd64 . --push

# Build and push the arm64 image
docker buildx build --platform linux/arm64 -t ipmake/custodia:latest-arm64 . --push

# Create and push the manifest
docker buildx imagetools create --tag ipmake/custodia:latest ipmake/custodia:latest-amd64 ipmake/custodia:latest-arm64
# docker buildx imagetools push ipmake/custodia:latest