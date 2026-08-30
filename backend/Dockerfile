FROM python:3.11-slim
 
WORKDIR /app
 
# System deps needed by Pillow/TensorFlow
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*
 
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
 
COPY . .
 
# Render (and most platforms) assign the port dynamically via $PORT.
# Defaults to 8000 for local `docker run` testing without setting it.
ENV PORT=8000
EXPOSE 8000
CMD uvicorn main:app --host 0.0.0.0 --port $PORT