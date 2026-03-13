FROM nginx:alpine

# Remover configuração padrão do nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuração customizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar arquivos do site
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/

# Porta exposta
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost/health || exit 1
