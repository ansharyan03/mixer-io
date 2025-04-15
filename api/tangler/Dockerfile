FROM --platform=linux/amd64 mambaorg/micromamba:ubuntu22.04
WORKDIR /app

ADD * .

RUN micromamba env create -f env/prod.yaml -y
RUN pip install -U git+https://github.com/CarlGao4/demucs.git@4.1.0-update

RUN micromamba activate splitter-env
CMD ["python", "-m", "fastapi", "run", "main.py"]
# replace the above line with production server command when deploying