FROM nginx
VOLUME /tmp
ENV LANG en_US.UTF-8
COPY dist  /usr/share/nginx/html/
#这个地方一定要把之前的默认给替换掉，不然使用这个默认nginx的镜像会无法替换配置
COPY my.conf  /etc/nginx/conf.d/default.conf
EXPOSE 80
EXPOSE 443
# docker build -t registry.cn-shenzhen.aliyuncs.com/jck/pig-ui:latest .
