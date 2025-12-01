FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 10000

# Use gunicorn to run Flask: change "app:app" if your file/object names differ
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "app:app"]
