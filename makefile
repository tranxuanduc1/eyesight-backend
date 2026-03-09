
.PHONY: run build remove
run:
	docker run -d -p 3001:3001 eyesight-backend
build:
	docker build -t eyesight-backend .
remove:
	docker rm -f $(docker ps -aq --filter ancestor=eyesight-backend)
