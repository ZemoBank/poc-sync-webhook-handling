# Async como Sync

Este projeto é uma prova de conceito (POC) que tem como objetivo transformar um sistema baseado em webhooks assíncronos em uma solução que permite respostas síncronas. Ele utiliza o Node.js com o framework Express para criar um servidor que gerencia eventos assíncronos por meio de webhooks.

## Configuração

Antes de executar o projeto, é necessário configurar as seguintes variáveis de ambiente:

- **'DOMAIN'**: O domínio do sistema a ser integrado.
- **'APIKEY'**: A chave de API para autenticação.
- **'TIMEOUT' (Opcional)**: O tempo limite em milissegundos para aguardar uma resposta assíncrona (padrão: 5000 ms).

## Estrutura do Projeto

### **'app.ts'**

O arquivo **app.ts** é o ponto de entrada da aplicação e contém a lógica principal do servidor Express. Ele define duas rotas principais:

1. **'/webhook'**: Recebe webhooks assíncronos e aciona eventos correspondentes usando **'EventManager'**.
2. **'/new-qrcode'**: Inicia uma solicitação síncrona para obter um novo código QR e espera a resposta usando **'EventManager'**.

### **'event-manager.ts'**

O módulo **'EventManager'** gerencia eventos assíncronos utilizando o mecanismo de publish/subscribe (pub/sub). Este módulo incorpora uma abordagem mais escalável na gestão de eventos. Ele mantém métodos para assistir a eventos, acionar eventos e lidar com erros. Os eventos são associados a um ID externo e podem ter listeners para sucesso, timeout e erro. Com a integração do pub/sub, quando uma instância do servidor não possui um listener em memória, ela dispara um evento para um canal de comunicação, permitindo que outras instâncias sejam notificadas e possam lidar com o evento assíncrono de forma eficiente.

A classe **'EventManager'** foi projetada seguindo uma interface que permite a integração com diferentes sistemas de pub/sub. Isso significa que a escolha da implementação específica do pub/sub fica a critério de quem está utilizando o módulo.

### **'redis-client.ts'**

No arquivo **'redis-client.ts'**, adicionamos uma classe chamada **'RedisClient'**. Esta classe encapsula a lógica necessária para interagir com o Redis, como a publicação e consumo de mensagens usando o mecanismo Pub/Sub. O canal utilizado para comunicação é denominado **'pubsub'**.

### **'api-client.ts'**

O módulo **'ApiClient'** encapsula a lógica de comunicação com a API externa usando Axios. Ele inclui métodos para trocar tokens, revalidar tokens e solicitar novos itens.

## Execução

Para executar o projeto, você tem a flexibilidade de escolher entre a forma tradicional ou utilizar Docker Compose. Aqui estão as instruções para ambos os métodos:

### Tradicional

1. Instale as dependências: **'npm install'**.
2. Configure as variáveis de ambiente.
3. Execute o projeto: **'npm start'**.

### Docker Compose
1. docker-compose up -d

> Lembre-se de adaptar o código conforme necessário para atender aos requisitos específicos do seu ambiente e integração. Este projeto é uma base flexível que pode ser expandida para atender a diferentes casos de uso.