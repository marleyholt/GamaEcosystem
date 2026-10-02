#!/bin/bash
# ==============================================================================
# GamaEcosystem - Script Automatizado de Atualização (Deploy Contínuo)
# Local no Servidor: /var/www/gamaecosystem/update.sh
# ==============================================================================

set -e

echo "🚀 Iniciando atualização do GamaEcosystem no servidor..."

# 1. Navegar até a pasta da aplicação
cd /var/www/gamaecosystem

# 2. Descartar alterações locais não comitadas e baixar o código novo do GitHub
echo "📥 Puxando atualizações do GitHub (branch main)..."
git reset --hard
git pull origin main

# 3. Instalar novas dependências caso tenham sido adicionadas
echo "📦 Verificando dependências npm..."
npm install --legacy-peer-deps --no-audit --no-fund

# 4. Compilar o frontend com Vite
echo "🏗️ Compilando nova versão (npm run build)..."
npm run build

# 5. Reiniciar a aplicação no PM2
echo "🔄 Reiniciando serviço no PM2..."
sudo pm2 restart gamaecosystem || pm2 restart gamaecosystem

echo "✅ Atualização concluída com sucesso! GamaEcosystem está 100% atualizado."
