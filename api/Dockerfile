FROM --platform=linux/amd64 mambaorg/micromamba:ubuntu22.04
WORKDIR /app

COPY models ./
COPY input ./
ADD *.py ./
COPY out ./
COPY env ./

RUN micromamba env create -f prod.yaml -y
RUN pip install -U git+https://github.com/CarlGao4/demucs.git@4.1.0-update

RUN micromamba activate splitter-env
CMD ["python", "-m", "fastapi", "dev", "main.py"]
# replace the above line with production server command when deploying