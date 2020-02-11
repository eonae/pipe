sudo docker run --name qb_test \
    -e POSTGRES_ROOT_PASSWORD=toor \
    -e POSTGRES_DATABASE=db \
    -e POSTGRES_USER=db \
    -e POSTGRES_PASSWORD=db \
    -d -p 127.0.0.1:5501:5432 postgres:10.8-alpine