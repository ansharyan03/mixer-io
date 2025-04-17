docker build -t 914809851189.dkr.ecr.us-east-1.amazonaws.com/tangle/web:latest frontend -f frontend/Dockerfile
docker build -t 914809851189.dkr.ecr.us-east-1.amazonaws.com/tangle/youtube-search:latest api/youtube_search -f api/youtube_search/Dockerfile

docker push 914809851189.dkr.ecr.us-east-1.amazonaws.com/tangle/web:latest
docker push 914809851189.dkr.ecr.us-east-1.amazonaws.com/tangle/youtube-search:latest

docker build -t 914809851189.dkr.ecr.us-east-1.amazonaws.com/tangle:latest api/tangler -f api/tangler/Dockerfile
docker push 914809851189.dkr.ecr.us-east-1.amazonaws.com/tangle:latest api/tangler