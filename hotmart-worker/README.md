# Liberação automática pela Hotmart (Cloudflare Worker)

O Worker recebe o Webhook da Hotmart, confere o **Hottok** em cada aviso e grava no Firestore:

- **Compra aprovada / completa** → `compras/<e-mail>` e `transacoes/<código HP…>` com `status: "ativa"`.
- **Cancelamento de assinatura, reembolso, chargeback ou compra cancelada** → `status: "cancelada"` e as contas liberadas pelo código da transação perdem o acesso.

No app: quem entra com o Google usando o e-mail da compra entra direto; com outro e-mail, digita o código da transação (libera uma conta só). Os convites manuais continuam funcionando.

Teste local (sem internet): `node hotmart-worker/teste.mjs`.

## Segredos do Worker
| Nome | Valor |
|---|---|
| `HOTTOK` | Hottok da conta Hotmart (Ferramentas → Webhook) |
| `FIREBASE_PROJECT_ID` | `tutor-estudos-f380b` |
| `FIREBASE_CLIENT_EMAIL` | `client_email` do JSON da conta de serviço |
| `FIREBASE_PRIVATE_KEY` | `private_key` do mesmo JSON (texto inteiro) |
| `PRODUTOS` (opcional, variável comum) | IDs dos produtos aceitos, separados por vírgula |
