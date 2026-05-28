# 1. Contextualização do Projeto de Extensão Universitária

## 1.1 Introdução

Este projeto de extensão tem como objetivo aplicar conhecimentos de Sistemas de Informação no desenvolvimento de uma solução digital para uma pequena empresa/parceiro local, com base em suas necessidades reais. A iniciativa visa proporcionar aos alunos uma experiência prática com levantamento de requisitos, prototipação e desenvolvimento ágil, ao mesmo tempo em que gera impacto positivo para a comunidade atendida.

A proposta será conduzida com base na metodologia ágil Scrum, incentivando a colaboração, a adaptação contínua e a entrega incremental de valor ao longo do desenvolvimento.

O sistema proposto consiste em uma aplicação web para gerenciamento de equipamentos e organização operacional de academias, voltada principalmente para os responsáveis pela administração do espaço, como gestores ou proprietários da academia.

Atualmente, muitas academias de pequeno e médio porte realizam o controle de seus equipamentos, manutenções e organização interna de forma manual, utilizando planilhas, anotações em papel ou apenas controle visual. Esse tipo de processo pode gerar dificuldades no acompanhamento do estado dos equipamentos, atrasos em manutenções preventivas e corretivas, além de dificultar a organização das informações relacionadas ao uso e disponibilidade dos aparelhos.

Diante desse cenário, o sistema desenvolvido terá como objetivo centralizar e organizar as informações relacionadas aos equipamentos da academia, facilitando o gerenciamento e reduzindo falhas operacionais.

---

## 1.2 Coleta de Informações com o Cliente

Nesta etapa, os alunos deverão realizar uma entrevista com o responsável pela empresa ou organização parceira para levantar informações sobre o contexto atual, identificar problemas e entender as expectativas em relação à solução tecnológica. 

O roteiro abaixo deve ser utilizado como base para a conversa. As perguntas devem ser respondidas de forma clara e completa, com base no que for dito pelo entrevistado. Caso necessário, os alunos podem complementar com perguntas adicionais.

Após a entrevista, os dados coletados devem ser analisados para definir a **proposta de solução** que será desenvolvida ao longo do projeto.

---

## 1.3 Entrevista Diagnóstica

A etapa de entrevista é fundamental para identificar as reais necessidades da empresa/parceiro atendido, servindo como base para definição dos requisitos do sistema.

### 1.4 Roteiro da Entrevista

_(Caso os alunos identifiquem a necessidade de incluir novas perguntas, podem fazê-lo.)_

---

### 1. Sobre o Entrevistado

**Nome:**  Carlos
**Cargo/função:**  Gerente e Proprietário
**Tempo na empresa:**  4 anos

---

### 2. Sobre a Empresa

**Qual o principal produto ou serviço prestado?**  
_Resposta:_  Prestação de serviços voltados para saúde e bem-estar, especificamente musculação, aulas de ginástica coletivas e acompanhamento físico.

**Quantos funcionários atuam atualmente?**  
_Resposta:_  Temos 8 funcionários (4 professores de educação física, 2 recepcionistas e 2 auxiliares de limpeza).

**Há algum sistema utilizado para controle interno? Qual?**  
_Resposta:_  Usamos apenas uma planilha no Excel para cadastro de alunos e o controle financeiro básico, além de fichas de papel impressas para os treinos.

---

### 3. Processos Atuais

**Como é feito o controle de processos (ex: estoque, vendas, agendamento)?**  
_Resposta:_  A matrícula e o pagamento da mensalidade são anotados na planilha pela recepção. Os treinos são montados pelos professores e impressos em fichas de papel que ficam em um arquivo. As manutenções das máquinas são anotadas em um caderno quando algum aluno ou professor relata um defeito.

**Quais ferramentas são utilizadas atualmente? (papel, planilhas, sistemas...)**  
_Resposta:_  Papel (fichas de treino e caderno de manutenção), planilhas do Excel (alunos e pagamentos) e WhatsApp (para cobrar alunos atrasados).

---

### 4. Dores e Dificuldades

**Quais tarefas consomem mais tempo ou causam retrabalho?**  
_Resposta:_  Atualizar as fichas de treino no papel toda vez consome muito tempo. Além disso, a recepção gasta horas cruzando dados da planilha com o banco para ver quem pagou a mensalidade.

**Há ocorrência de erros ou desperdícios? Em quais situações?**  
_Resposta:_  Sim. Muitas vezes os alunos perdem a ficha de papel e o professor tem que imprimir de novo. Outro grande problema é que máquinas ficam quebradas por dias porque o aviso de defeito ficou perdido no caderno e a manutenção não foi chamada a tempo, gerando reclamação dos clientes.

---

### 5. Expectativas

**Que tipo de solução poderia facilitar o seu dia a dia?**  
_Resposta:_  Um sistema único onde a recepção pudesse ver facilmente quem está devendo, onde o aluno pudesse acessar seu treino pelo celular sem precisar de papel, e onde nós pudéssemos registrar e ser alertados sobre a manutenção das máquinas antes que elas quebrem de vez.

**Já foi feita alguma tentativa anterior de resolver esse problema?**  
_Resposta:_  Tentamos usar o Google Drive para compartilhar as fichas de treino, mas os alunos tinham dificuldade de acessar e os professores achavam ruim atualizar pelo celular durante as aulas.

---

### 6. Análise e Validação

_Após a realização da entrevista, as informações serão analisadas para identificar padrões, gargalos e oportunidades de melhoria. Com base nisso, os alunos deverão elaborar uma proposta de solução tecnológica que será validada com o cliente antes de ser desenvolvida._ 


> Roteiro para ajudar na escrita do texto referente a proposta de sistema que será desenvolvida. Descreva de forma clara:
> - Qual problema será resolvido
> - Qual será a principal funcionalidade do sistema
> - Quem será o usuário principal
> - Qual impacto esperado para a empresa/parceiro

---
O **GymPro** será um sistema web focado na gestão integrada de academias, voltado para facilitar o dia a dia da recepção, dos professores e da gerência. A plataforma permitirá:

- **Gestão de Alunos:** Cadastro unificado de alunos, permitindo o acompanhamento de status de mensalidades (adimplentes/inadimplentes).
- **Fichas de Treino Digitais:** Criação e atualização de rotinas de treino diretamente no sistema, eliminando o uso de papel e permitindo fácil visualização.
- **Controle de Equipamentos e Manutenção:** Registro do inventário de máquinas e criação de um cronograma de manutenção preventiva e corretiva, com status de funcionamento (ativo/em manutenção).

**O problema a ser resolvido:** A desorganização gerada pelo uso de papéis e planilhas desconectadas, que resulta em perda de informações de treino, dificuldade no controle financeiro e atrasos na manutenção de máquinas, prejudicando a experiência do cliente.

**Usuários Principais:** Recepcionistas (controle de acesso e pagamentos), Professores (montagem de treinos) e Gerência (acompanhamento geral e gestão de manutenções).

**Impacto Esperado:** Otimização do tempo da equipe, redução de custos com papel, aumento da vida útil dos equipamentos através da manutenção preventiva e melhoria na satisfação dos alunos com um atendimento mais ágil e moderno.


---







