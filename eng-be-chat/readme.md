## Remember install these value in vault (local~dev)

1. Step 0 Run docker compose first

2. Step 1 access
   docker exec -it vault sh

3. Step 2 export value
   export VAULT_ADDR='http://localhost:8200'
   export VAULT_TOKEN=<'your token'>
4. Step 3 enable secret: vault secrets enable -path=secret kv-v2

5. Step 4 put value on command or ui
   vault kv put secret/eng-chat-service secret-mysql-username=<your root>  secret-mysql-password=<your pass>


