# usage
1. start up docker desktop
2. clone this repo
3. open in **vs code**
4. follow the instructions below to run the development environment
- ```cmd + shift + p``` -> "reopen in container" or "rebuild and reopen in container" (if these options don't show up install [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- from here, you can do any coding/testing in the container and exit the container whenever you want and all your files will be saved on your computer so you can work with git when you're done
- run cobalt API with terminal -> `cd tools/cobalt-main` -> `docker compose up` or `docker compose up -d` if you want to run in *detached mode* (in the background).
- anywhere in the code where you reference the cobalt API either use localhost or the ngrok link that you host with (instruction underneath)
- **(optional)** run `ngrok http http://localhost:9000` to create a sort of global link for it that you can share/use in any app or .env file
- run any other services using the docker compose file that i set up in the repository root, comment out any services you don't want to run in **docker-compose.yaml**.
