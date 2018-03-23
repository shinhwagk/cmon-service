docker run -itd \
    -p 9510:80 \
    -v `pwd`/os:/etc/nginx/html/files/os \
    -v `pwd`/nginx.conf:/etc/nginx/nginx.conf:ro \
    nginx:1.13.9