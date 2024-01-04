# Projeto Controle de Gastos

Projeto elaborado durante o recesso, que consiste em registrar e separar os registros de pagamento de um mês por categorias, determinando saldo disponível e percentual gasto.

## O que foi utilizado

### Frontend
- React.js;
- Axios;
- TailwindCSS;
- Sweetalert2;
- Font Awesome;
- Typescript.

### Backend
- Express.js;
- Knex.js;
- PostgreSQL;
- Consign (une as requisições necessárias);
- Body Parser;
- Cors;
- Typescript.

## Funcionalidades

### Registro de pagamentos
- O sistema aceita oito categorias (Contas, Investimentos, Lazer, Alimentação, Compras, Saúde, Viagens e Outros)
- O usuário pode sinalizar a forma de pagamento: Débito, Crédito, em espécie e PIX;
- Caso haja pagamento em crédito, o valor é registrado nos meses seguintes. Neste caso, estou considerando 12 parcelas, todas sem juros;
- Com exceção da descrição, todos os campos devem ser preenchidos;
- Exceto pela modalidade Crédito (que passa o pagamento para o mês seguinte), existem validações sobre saldo disponível.

### Configuração
- Na execução do sistema, automaticamente é renderizado os dados referente ao mês atual. Caso o usuário queira, pode alterar para datas anteriores;
- O usuário pode informar infinitas fontes de receita;
- Uma vez salvo, o usuário não consegue alterar as receitas, apenas adicionar novas;
- Caso o mês anterior seja encerrado com valores disponíveis, o mesmo é registrado no mês posterior como uma fonte de receita.

### Dashboard
- Mostra a soma das receitas mensais informadas pelo usuário;
- A cada inserção, os indicativos por categoria (Saúde, Investimentos...) é atualizada, assim como os totais por forma de pagamento;
- Com exceção do "Total de Despesas" e "Saldo disponível", todas as informações restantes possuem um botão que, ao clicar, é exibido as informações correspondentes ao mesmo.

## Resultado

### Página principal
![Listagem](/assets/Listagem%20de%20gastos.png)

### Registro de pagamento

#### Geral
![Registro_Pagamento](/assets/registro_pagamento.png)

#### Crédito
![Registro_Pagamento_Credito](/assets/registro_credito.png)

### Configurações (receitas, mudança de data)
![Config](/assets/registro_receita.png)


