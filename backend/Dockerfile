# Usar imagen ligera de Node.js LTS basada en Alpine
FROM node:20-alpine

# Definir directorio de trabajo en el contenedor
WORKDIR /app

# Configurar entorno de producción
ENV NODE_ENV=production

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --omit=dev || npm install --omit=dev

# Copiar el código fuente de la aplicación
COPY . .

# Puerto por defecto (Railway asigna dinámicamente el puerto en $PORT)
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
