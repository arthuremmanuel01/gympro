# 2. Especificações do Projeto

Pré-requisitos: <a href="1-Contexto.md"> Documentação de Contexto</a>

> Apresente uma visão geral do que será abordado nesta parte do documento, enumerando as técnicas e/ou ferramentas utilizadas para realizar a especificações do projeto.

## 2.1 Personas

**Persona 1**  
**Nome:** Carlos Eduardo
**Idade:** 45 anos
**Profissão:** Proprietário e Gerente da Academia
**Perfil:** Carlos Eduardo é dono da academia há 5 anos. Seu dia a dia é caótico: ele atua na parte administrativa, financeira e ainda precisa lidar com fornecedores e manutenções estruturais. Ele passa a maior parte do tempo resolvendo problemas urgentes em vez de focar no crescimento do negócio.
* **Objetivos principais ao usar a aplicação:**
    * Ter uma visão clara e rápida sobre a saúde financeira do negócio (quem pagou e quem está devendo).
    * Garantir que os equipamentos estejam sempre funcionando para evitar a perda de clientes.
    * Profissionalizar a gestão da academia para competir com as grandes redes.
* **Dores/problemas:**
    * **Perda de receita por desorganização:** A recepção demora horas cruzando planilhas de Excel com o extrato bancário. Com isso, alunos inadimplentes acabam treinando de graça por dias até que a cobrança manual via WhatsApp seja feita.
    * **Manutenções "surpresa" e reclamações:** Como o controle de falhas é feito em um caderno de papel, muitos avisos de defeitos se perdem. As máquinas quebram totalmente antes que consiga chamar o técnico, gerando frustração nos alunos e altos custos de conserto emergencial.
    * **Falta de visão gerencial:** Ele não sabe dizer exatamente quantas máquinas estão inativas hoje ou qual o percentual de alunos inadimplentes sem ter que parar e calcular manualmente.
* **Motivações:** Reduzir os custos operacionais (como manutenção corretiva cara e perda de papéis), aumentar a vida útil do maquinário e parar de perder alunos por conta de esteiras e polias constantemente quebradas.
* **Cenário de uso:** Toda manhã, ao chegar na academia, Cadu senta em seu escritório, abre o GymPro no computador desktop, acessa o *Dashboard* (painel geral) para checar o número de alunos inadimplentes do dia e verificar se o sistema emitiu algum alerta de equipamento precisando de manutenção preventiva.

**Persona 2**  
**Nome:** Mariana Silva
**Idade:** 28 anos
**Profissão:** Professora de Educação Física / Instrutora de Musculação
**Perfil:** Mariana atua na área de musculação no horário de pico (18h às 22h). Ela atende até 20 alunos simultaneamente, tirando dúvidas de execução e montando treinos. O ritmo é frenético e ela está sempre se movimentando.
* **Objetivos principais ao usar a aplicação:**
    * Montar e alterar os treinos dos alunos de forma rápida e prática.
    * Saber rapidamente quais máquinas estão disponíveis para adaptar as fichas dos alunos na hora.
* **Dores/problemas:**
    * **Retrabalho e desperdício de tempo:** Ela perde muito tempo escrevendo ou imprimindo fichas de papel. Toda semana, alunos perdem a ficha ou a suam a ponto de rasgar, obrigando-a a parar o atendimento no salão para ir até a recepção reimprimir o treino.
    * **Falta de comunicação sobre a infraestrutura:** Ao montar um treino, ela frequentemente coloca exercícios em máquinas que estão quebradas, pois ninguém a avisou. Isso causa retrabalho na hora do treino, quando o aluno volta para reclamar que o aparelho não funciona.
* **Motivações:** Quer focar na biomecânica e no atendimento de qualidade aos alunos, ajudando-os a alcançar resultados, e não atuar como uma "impressora ambulante" ou secretária de fichas.
* **Cenário de uso:** Durante o expediente, Mariana usa um tablet da academia (ou o próprio celular). Ela acessa a área logada de Professores para criar a ficha de um aluno novo em poucos cliques, atualiza a série de outro aluno na hora e registra no sistema que o "Leg Press 45" está travando para que a gerência receba o alerta.

**Persona 3**  
* **Nome:** Lucas Fernandes
* **Idade:** 22 anos
* **Profissão:** Estudante Universitário e Estagiário
* **Perfil:** Lucas tem uma rotina corrida entre a faculdade e o estágio. Ele tem exatamente 1 hora cronometrada para treinar no fim do dia. Ele vai à academia de fones de ouvido, quer focar em seu treino sem muitas interrupções e valoriza a praticidade.
* **Objetivos principais ao usar a aplicação:**
    * Acessar seu treino do dia de forma rápida pelo seu próprio celular.
    * Saber exatamente as séries, repetições e métodos sem ter que carregar papel.
* **Dores/problemas:**
    * **A frustração com as fichas físicas:** Ele odeia ter que procurar sua ficha de papel na caixa da recepção, que frequentemente some. Tentar usar o antigo sistema do Google Drive era lento e ruim no celular.
    * **Experiência ruim com o ambiente:** Fica extremamente irritado quando planeja fazer seu treino de pernas e descobre na hora que duas das principais máquinas estão quebradas (e sem aviso), atrasando toda a sua rotina apertada.
    * **Lentidão no acesso:** Como o sinal de internet da academia flutua, ele não tem paciência para sistemas pesados. Precisa que o acesso à ficha seja praticamente instantâneo.
* **Motivações:** Ter autonomia no treino, acompanhar sua evolução e sentir que frequenta uma academia moderna que valoriza a sua experiência e o seu tempo.
* **Cenário de uso:** Lucas chega na catraca, abre o seu celular e loga no GymPro. A interface responsiva carrega imediatamente. Ele coloca o celular no suporte da máquina, visualiza seu treino do dia, acompanha as séries e verifica no próprio app se as próximas máquinas que estão ativas ou em manutenção.

---
#### ⚠️ **ATENÇÃO**
Os quadros abaixo devem ser preenchidos com os **requisitos funcionais e não funcionais** específicos do sistema que está sendo desenvolvido.  

✅ **Importante:**  
- Não existe número mínimo obrigatório de requisitos.  
- Será avaliado se **todos os requisitos funcionais propostos** foram **efetivamente desenvolvidos** até a entrega final.
- Cada requisito deve ser claro, único e representar uma característica da sua solução.
--- 



### 2.2 REQUISITOS FUNCIONAIS

> Preencha a tabela abaixo com os requisitos funcionais que **detalham as funcionalidades que seu sistema deverá oferecer**.  
> Cada requisito deve representar uma característica única da solução e ser claro para orientar o desenvolvimento.


|ID    | Descrição do Requisito                                                                                            | Prioridade |
|------|-------------------------------------------------------------------------------------------------------------------|------------|
|RF-01| O sistema deve permitir a autenticação (login) com controle de acesso por perfis (Alunos, Professores, Recepção e Gerência). | ALTA       | 
|RF-02| O sistema deve permitir o cadastro, edição e exclusão (CRUD) de alunos de forma unificada.                        | ALTA       |
|RF-03| O sistema deve permitir o controle de pagamento de mensalidades, indicando status de "adimplente" ou "inadimplente". | ALTA       |
|RF-04| O sistema deve permitir que os professores criem, atualizem e excluam fichas de treino digitais para os alunos.   | ALTA       |
|RF-05| O sistema deve permitir que os alunos visualizem suas próprias fichas de treino digitalmente.                     | ALTA       |
|RF-06| O sistema deve permitir o cadastro e gerenciamento do inventário de equipamentos e máquinas da academia.          | MÉDIA      |
|RF-07| O sistema deve permitir o registro de cronograma de manutenção preventiva e corretiva para os equipamentos.       | MÉDIA      |
|RF-08| O sistema deve exibir e atualizar o status de funcionamento das máquinas (ex: ativo, em manutenção, com defeito). | MÉDIA      |
|RF-09| O sistema deve emitir alertas/avisos internos quando um equipamento for reportado com defeito.                    | MÉDIA      |
|RF-10| O sistema deve apresentar um painel geral (dashboard) para a gerência acompanhar alunos inadimplentes e manutenções. | BAIXA      |

### 2.3 REQUISITOS NÃO FUNCIONAIS

> Preencha a tabela abaixo com os requisitos não funcionais que definem **características desejadas para o sistema que irão desenvolver**, como desempenho, segurança, usabilidade, etc.  
> Lembre-se que esses requisitos são importantes para garantir a qualidade da solução.

|ID     | Descrição do Requisito                                                                              |Prioridade |
|-------|-----------------------------------------------------------------------------------------------------|-----------|
|RNF-01| O sistema deve carregar as páginas em até 3 segundos para garantir uma boa experiência ao usuário.  | MÉDIA     | 
|RNF-02| O sistema deve proteger as informações dos usuários e senhas por meio de criptografia básica.       | ALTA      | 
|RNF-03| A interface deve ser totalmente responsiva, permitindo que alunos acessem seus treinos pelo celular.| ALTA      |
|RNF-04| O front-end do sistema deve ser construído utilizando o framework React.js.                         | ALTA      |
|RNF-05| O sistema deve possuir uma interface de fácil usabilidade para que a recepção cruze dados rapidamente.| MÉDIA     |
|RNF-06| O banco de dados utilizado para persistência das informações da academia deverá ser o MySQL.        | ALTA      |

---

## 2.4 RESTRIÇÕES

> Restrições são limitações externas impostas ao projeto que devem ser rigorosamente obedecidas durante o desenvolvimento. Elas podem estar relacionadas a prazos, tecnologias obrigatórias ou proibidas, ambiente de execução, normas legais ou políticas internas da organização. Diferente dos requisitos não funcionais, que indicam características desejadas do sistema, as restrições determinam limites fixos que influenciam as decisões de projeto.

> A tabela abaixo deve ser preenchida com as restrições específicas que **impactam seu projeto**. Caso não haja alguma restrição adicional além das já listadas, mantenha a tabela conforme está.

| ID  | Restrição                                                        |
|------|-----------------------------------------------------------------|
| 01   | O projeto deverá ser entregue até o final do semestre.          |
| 02   | O tempo de desenvolvimento está limitado a 4 Sprints, conforme definido no planejamento. |
| 03   | A equipe de desenvolvimento é restrita aos 4 membros acadêmicos listados no projeto.     |
| 04   | Não haverá implantação obrigatória em ambiente de produção (hospedagem comercial).       |
| 05   | O sistema não poderá depender de APIs pagas ou softwares com licenciamento proprietário. |




 
> **Links Úteis**:
> - [O que são Requisitos Funcionais e Requisitos Não Funcionais?](https://codificar.com.br/requisitos-funcionais-nao-funcionais/)
> - [O que são requisitos funcionais e requisitos não funcionais?](https://analisederequisitos.com.br/requisitos-funcionais-e-requisitos-nao-funcionais-o-que-sao/)
