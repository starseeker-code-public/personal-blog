FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Normalise line endings on entrypoint (guard against CRLF when the repo
# is checked out on Windows) and make it executable.
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh

# The entrypoint boots uvicorn, runs the test suite against it, and only
# keeps the container serving if every test passes.
CMD ["./entrypoint.sh"]
