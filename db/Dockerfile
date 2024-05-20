FROM postgres

# Set environment variables for PostgreSQL
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=appdb

# Copy the initialization SQL script
COPY init.sql /docker-entrypoint-initdb.d/

# Install necessary packages, build and install pgvector
RUN apt-get update && apt-get install -y \
    tzdata \             
    build-essential \
    git \
    postgresql-server-dev-all \
    && git clone --branch v0.5.0 https://github.com/pgvector/pgvector.git /tmp/pgvector \
    && cd /tmp/pgvector \
    && make \
    && make install \
    && rm -rf /var/lib/apt/lists/* /tmp/pgvector

# Set the timezone
ENV TZ=Europe/Istanbul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

USER postgres
