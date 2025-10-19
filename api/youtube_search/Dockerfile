FROM python:alpine


COPY * .

RUN pip install -r requirements.txt

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
