# requirements
if not using dev containers, you will need the following:
- anaconda
    - install environment from conda configuration file `api/tangler/env/` `prod.yaml`
    - in environment, install pip requirements from `requirements.txt`
- node.js
    - check package.json, deno required for compiling Invidious Companion
- [Invidious Companion](https://github.com/iv-org/invidious-companion)

otherwise, use the Dev Containers extension to run the environment with the requirements pre-installed.

# for public use

you can either access and run Tangle by setting up the development environment and running the frontend with next.js and the api with uvicorn.

the **most efficient** way to get set up with Tangle is to use Docker Compose. create a new folder to work out of, cd into the folder, and run `docker compose up` to run the app.

if you are running the app on a computer with a CUDA-enabled GPU, change the Docker Compose YAML definition, updating the Tangler service to use the CUDA version of the container. * WIP *

# 

## invidious troubleshooting
you will need to follow the instructions on Invidious Companion's GitHub for compiling an Invidious server executable with Deno. the image provided with the Docker Compose definition should take care of this.


# development environment
1. start up docker desktop
2. clone this repo
3. open in **vs code**
4. follow the instructions below to run the development environment
- ```cmd + shift + p``` -> "reopen in container" or "rebuild and reopen in container" (if these options don't show up install [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- from here, you can do any coding/testing in the container and exit the container whenever you want and all your files will be saved on your computer so you can work with git when you're done
- run cobalt API with terminal -> `cd tools/cobalt-main` -> `docker compose up` or `docker compose up -d` if you want to run in *detached mode* (in the background). [api docs](https://github.com/ansharyan03/mixer-io/blob/master/tools/cobalt-main/docs/api.md) * WIP: This has been substituted for Invidious.*
- anywhere in the code where you reference the cobalt API either use localhost or the ngrok link that you host with (instruction underneath)
- **(optional)** run `ngrok http http://localhost:9000` to create a sort of global link for it that you can share/use in any app or .env file
- run any other services using the docker compose file that i set up in the repository root, comment out any services you don't want to run in **docker-compose.yaml**.

