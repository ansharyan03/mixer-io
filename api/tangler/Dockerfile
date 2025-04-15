FROM mambaorg/micromamba:ubuntu22.04
WORKDIR /app

WORKDIR /app/env
ADD env .

WORKDIR /app/utils
ADD utils .

WORKDIR /app
COPY *.* .

RUN micromamba env create -f env/prod.yaml -y
RUN micromamba run -n splitter-env pip install -U git+https://github.com/CarlGao4/demucs.git@4.1.0-update

EXPOSE 5000

CMD ["micromamba", "run", "-n", "splitter-env", "python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000"]
# replace the above line with production server command when deploying