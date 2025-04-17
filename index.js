// Dados do questionário
const surveyData = {
    questions: [
        {
            id: 1,
            text: "Escolha a opção que melhor te representa:",
            type: "single",
            options: [
                { text: "Gestor de Tráfego", icon: "fa-chart-line" },
                { text: "Dono de Agência", icon: "fa-globe" },
                { text: "Dono de Negócio", icon: "fa-briefcase" },
                { text: "Infoprodutor", icon: "fa-rocket" }
            ]
        },
        {
            id: 2,
            text: "Com qual destas áreas você mais se identifica?",
            type: "single",
            options: [
                { text: "Marketing Digital", icon: "fa-bullhorn" },
                { text: "Design e Criação", icon: "fa-palette" },
                { text: "Vendas", icon: "fa-coins" },
                { text: "Tecnologia", icon: "fa-laptop-code" }
            ]
        },
        {
            id: 3,
            text: "Quais ferramentas você utiliza no dia a dia?",
            type: "multiple",
            options: [
                { text: "Facebook Ads", icon: "fa-facebook" },
                { text: "Google Ads", icon: "fa-google" },
                { text: "E-mail Marketing", icon: "fa-envelope" },
                { text: "SEO", icon: "fa-search" },
                { text: "Análise de Dados", icon: "fa-chart-pie" }
            ]
        },
        {
            id: 4,
            text: "Como você avalia seu conhecimento na área?",
            type: "rating",
            maxRating: 5
        },
        {
            id: 5,
            text: "Deixe um comentário ou dúvida (opcional):",
            type: "text"
        }
    ]
};

// Armazenamento de respostas
const surveyResponses = {
    startTime: null,
    endTime: null,
    answers: {}
};

// Elementos DOM
const welcomeScreen = document.getElementById('welcome-screen');
const questionsContainer = document.getElementById('questions-container');
const thankYouScreen = document.getElementById('thank-you-screen');
const startButton = document.getElementById('start-survey');
const progressBar = document.getElementById('progress-bar');
const restartButton = document.getElementById('restart-survey');
const header = document.querySelector('header');
const progressContainer = document.querySelector('.progress-container');
const logo = document.querySelector('.logo');

let currentQuestionIndex = 0;
let lastScrollTop = 0; // Para detectar a direção do scroll

// Função para controlar elementos no scroll
window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 20) {
        // Se rolou mais de 20px, esconde os elementos
        header.style.opacity = '0';
        progressContainer.style.opacity = '0';
    } else {
        // Se estiver próximo ao topo, mostra os elementos
        header.style.opacity = '1';
        progressContainer.style.opacity = '1';
    }
});

// Variáveis globais
let currentScreen = 0;
let answers = {};
let questions = surveyData.questions;

// Iniciar questionário
startButton.addEventListener('click', () => {
    welcomeScreen.classList.remove('active');
    questionsContainer.classList.add('active');
    surveyResponses.startTime = new Date();
    showQuestion(0);
    updateProgressBar(0);
});

// Reiniciar questionário
if (restartButton) {
    restartButton.addEventListener('click', () => {
        // Resetar respostas
        surveyResponses.answers = {};
        currentQuestionIndex = 0;
        
        // Voltar para a tela inicial
        thankYouScreen.classList.remove('active');
        welcomeScreen.classList.add('active');
        
        // Resetar barra de progresso
        updateProgressBar(0);
    });
}

// Atualizar barra de progresso
function updateProgressBar(questionIndex) {
    const totalQuestions = surveyData.questions.length;
    const progressPercentage = (questionIndex / totalQuestions) * 100;
    
    progressBar.style.width = `${progressPercentage}%`;
}

// Exibir questão atual
function showQuestion(index) {
    if (index >= surveyData.questions.length) {
        finishSurvey();
        return;
    }

    currentQuestionIndex = index;
    updateProgressBar(index);

    // Limpar conteúdo anterior
    questionsContainer.innerHTML = '';
    
    // Adicionar botão para voltar (exceto primeira pergunta) - MOVIDO PARA O TOPO
    if (index > 0) {
        const backButton = document.createElement('button');
        backButton.textContent = 'Voltar';
        backButton.classList.add('back-button');
        
        backButton.addEventListener('click', () => {
            goToPreviousScreen();
        });
        
        questionsContainer.appendChild(backButton);
    }
    
    const question = surveyData.questions[index];
    const questionElement = document.createElement('div');
    questionElement.classList.add('question');
    
    // Adicionar cabeçalho da questão
    const questionHeading = document.createElement('div');
    questionHeading.classList.add('question-heading');
    
    const questionText = document.createElement('h2');
    questionText.textContent = question.text;
    questionHeading.appendChild(questionText);
    
    questionElement.appendChild(questionHeading);
    
    // Adicionar opções baseadas no tipo de questão
    const optionsContainer = document.createElement('div');
    optionsContainer.classList.add('options');
    
    switch (question.type) {
        case 'single':
            createSingleChoiceOptions(question, optionsContainer, index);
            break;
        
        case 'multiple':
            createMultipleChoiceOptions(question, optionsContainer, index);
            break;
            
        case 'rating':
            createRatingOptions(question, optionsContainer, index);
            break;
            
        case 'text':
            createTextOption(question, optionsContainer, index);
            break;
    }
    
    questionElement.appendChild(optionsContainer);
    
    // Para múltipla escolha e texto, ainda precisamos de um botão de continuar
    if (question.type === 'multiple' || question.type === 'text') {
        const continueButton = document.createElement('button');
        continueButton.classList.add('btn', 'primary-btn');
        continueButton.textContent = index === surveyData.questions.length - 1 ? 'Finalizar' : 'Continuar';
        continueButton.style.display = 'block';
        continueButton.style.margin = '1.5rem auto 0';
        
        continueButton.addEventListener('click', () => {
            if (validateQuestion(question)) {
                saveResponse(question);
                showQuestion(index + 1);
            }
        });
        
        questionElement.appendChild(continueButton);
    }
    
    questionsContainer.appendChild(questionElement);
    
    // Se já existe resposta para essa pergunta, preencher
    if (surveyResponses.answers[question.id]) {
        populateExistingAnswer(question);
    }
}

// Funções para criar diferentes tipos de perguntas
function createSingleChoiceOptions(question, container, questionIndex) {
    question.options.forEach((option, i) => {
        const optionDiv = document.createElement('div');
        optionDiv.classList.add('option');
        
        const optionContent = document.createElement('div');
        optionContent.classList.add('option-content');
        
        // Criar ícone
        const iconDiv = document.createElement('div');
        iconDiv.classList.add('option-icon');
        const icon = document.createElement('i');
        icon.className = `fas ${option.icon}`;
        iconDiv.appendChild(icon);
        
        // Criar texto da opção
        const textDiv = document.createElement('div');
        textDiv.classList.add('option-text');
        textDiv.textContent = option.text;
        
        // Criar seta à direita
        const arrowDiv = document.createElement('div');
        arrowDiv.classList.add('option-arrow');
        const arrowIcon = document.createElement('i');
        arrowIcon.className = 'fas fa-chevron-right';
        arrowDiv.appendChild(arrowIcon);
        
        // Adicionar input radio (oculto)
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `question-${question.id}`;
        radio.id = `option-${question.id}-${i}`;
        radio.value = option.text;
        
        optionContent.appendChild(iconDiv);
        optionContent.appendChild(textDiv);
        optionContent.appendChild(arrowDiv);
        optionDiv.appendChild(radio);
        optionDiv.appendChild(optionContent);
        
        // Adicionar comportamento de seleção com avanço automático
        optionDiv.addEventListener('click', () => {
            // Remover seleção anterior
            document.querySelectorAll(`.option`).forEach(opt => opt.classList.remove('selected'));
            
            // Selecionar essa opção
            radio.checked = true;
            optionDiv.classList.add('selected');
            
            // Pequeno atraso para o usuário ver a seleção antes de avançar
            setTimeout(() => {
                saveResponse(question);
                showQuestion(questionIndex + 1);
            }, 400);
        });
        
        container.appendChild(optionDiv);
    });
}

function createMultipleChoiceOptions(question, container) {
    // Texto de instrução
    const instruction = document.createElement('p');
    instruction.textContent = 'Selecione todas as opções que se aplicam';
    instruction.style.textAlign = 'center';
    instruction.style.fontSize = '0.9rem';
    instruction.style.color = '#777';
    instruction.style.marginBottom = '1rem';
    container.appendChild(instruction);
    
    question.options.forEach((option, i) => {
        const optionDiv = document.createElement('div');
        optionDiv.classList.add('option');
        
        const optionContent = document.createElement('div');
        optionContent.classList.add('option-content');
        
        // Criar ícone
        const iconDiv = document.createElement('div');
        iconDiv.classList.add('option-icon');
        const icon = document.createElement('i');
        icon.className = `fas ${option.icon}`;
        iconDiv.appendChild(icon);
        
        // Criar texto da opção
        const textDiv = document.createElement('div');
        textDiv.classList.add('option-text');
        textDiv.textContent = option.text;
        
        // Criar checkbox para seleção múltipla
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = `question-${question.id}`;
        checkbox.id = `option-${question.id}-${i}`;
        checkbox.value = option.text;
        
        optionContent.appendChild(iconDiv);
        optionContent.appendChild(textDiv);
        
        // Substituir a seta por um checkbox estilizado
        const checkmarkDiv = document.createElement('div');
        checkmarkDiv.classList.add('option-arrow');
        const checkIcon = document.createElement('i');
        checkIcon.className = 'fas fa-check';
        checkmarkDiv.appendChild(checkIcon);
        optionContent.appendChild(checkmarkDiv);
        
        optionDiv.appendChild(checkbox);
        optionDiv.appendChild(optionContent);
        
        // Adicionar comportamento de seleção
        optionDiv.addEventListener('click', () => {
            checkbox.checked = !checkbox.checked;
            optionDiv.classList.toggle('selected', checkbox.checked);
        });
        
        container.appendChild(optionDiv);
    });
}

function createRatingOptions(question, container, questionIndex) {
    // Texto de instrução
    const instruction = document.createElement('p');
    instruction.textContent = 'Toque em uma estrela para avaliar';
    instruction.style.textAlign = 'center';
    instruction.style.fontSize = '0.9rem';
    instruction.style.color = '#777';
    instruction.style.marginBottom = '0.5rem';
    container.appendChild(instruction);
    
    const ratingContainer = document.createElement('div');
    ratingContainer.classList.add('rating-container');
    
    for (let i = 1; i <= question.maxRating; i++) {
        const star = document.createElement('span');
        star.classList.add('rating-star');
        star.innerHTML = '★';
        star.dataset.value = i;
        
        star.addEventListener('click', (e) => {
            const value = e.target.dataset.value;
            
            // Remover classe selecionada de todas as estrelas
            document.querySelectorAll('.rating-star').forEach(s => s.classList.remove('selected'));
            
            // Adicionar classe selecionada às estrelas até o valor clicado
            document.querySelectorAll(`.rating-star`).forEach(s => {
                if (parseInt(s.dataset.value) <= value) {
                    s.classList.add('selected');
                }
            });
            
            // Armazenar valor temporariamente
            container.dataset.ratingValue = value;
            
            // Pequeno atraso para o usuário ver a seleção antes de avançar
            setTimeout(() => {
                saveResponse(question);
                showQuestion(questionIndex + 1);
            }, 600);
        });
        
        ratingContainer.appendChild(star);
    }
    
    container.appendChild(ratingContainer);
}

function createTextOption(question, container, questionIndex) {
    const textarea = document.createElement('textarea');
    textarea.id = `question-${question.id}`;
    textarea.rows = 4;
    textarea.placeholder = 'Digite sua resposta aqui...';
    
    // Adicionar um contador de caracteres
    const charCounter = document.createElement('div');
    charCounter.classList.add('char-counter');
    charCounter.textContent = '0 caracteres';
    charCounter.style.fontSize = '0.8rem';
    charCounter.style.color = '#777';
    charCounter.style.textAlign = 'right';
    charCounter.style.marginTop = '0.5rem';
    
    textarea.addEventListener('input', () => {
        const count = textarea.value.length;
        charCounter.textContent = `${count} caractere${count !== 1 ? 's' : ''}`;
    });
    
    container.appendChild(textarea);
    container.appendChild(charCounter);
}

// Validação de respostas
function validateQuestion(question) {
    switch (question.type) {
        case 'single':
            const selectedRadio = document.querySelector(`input[name="question-${question.id}"]:checked`);
            if (!selectedRadio) {
                return false;
            }
            return true;
            
        case 'multiple':
            // Múltipla escolha é opcional
            return true;
            
        case 'rating':
            const ratingValue = document.querySelector('.options').dataset.ratingValue;
            if (!ratingValue) {
                return false;
            }
            return true;
            
        case 'text':
            // Campo de texto é opcional
            return true;
            
        default:
            return true;
    }
}

// Salvar respostas
function saveResponse(question) {
    let response;
    
    switch (question.type) {
        case 'single':
            const selectedRadio = document.querySelector(`input[name="question-${question.id}"]:checked`);
            response = selectedRadio.value;
            break;
            
        case 'multiple':
            const selectedCheckboxes = document.querySelectorAll(`input[name="question-${question.id}"]:checked`);
            response = Array.from(selectedCheckboxes).map(cb => cb.value);
            break;
            
        case 'rating':
            response = document.querySelector('.options').dataset.ratingValue;
            break;
            
        case 'text':
            response = document.querySelector(`#question-${question.id}`).value;
            break;
    }
    
    surveyResponses.answers[question.id] = {
        questionText: question.text,
        response: response,
        timestamp: new Date()
    };
    
    console.log('Resposta salva:', surveyResponses.answers[question.id]);
}

// Preencher resposta existente
function populateExistingAnswer(question) {
    const savedResponse = surveyResponses.answers[question.id].response;
    
    switch (question.type) {
        case 'single':
            const radio = document.querySelector(`input[value="${savedResponse}"]`);
            if (radio) {
                radio.checked = true;
                radio.closest('.option').classList.add('selected');
            }
            break;
            
        case 'multiple':
            if (Array.isArray(savedResponse)) {
                savedResponse.forEach(value => {
                    const checkbox = document.querySelector(`input[value="${value}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        checkbox.closest('.option').classList.add('selected');
                    }
                });
            }
            break;
            
        case 'rating':
            document.querySelectorAll('.rating-star').forEach(star => {
                if (parseInt(star.dataset.value) <= parseInt(savedResponse)) {
                    star.classList.add('selected');
                }
            });
            document.querySelector('.options').dataset.ratingValue = savedResponse;
            break;
            
        case 'text':
            document.querySelector(`#question-${question.id}`).value = savedResponse || '';
            const charCounter = document.querySelector('.char-counter');
            if (charCounter && savedResponse) {
                const count = savedResponse.length;
                charCounter.textContent = `${count} caractere${count !== 1 ? 's' : ''}`;
            }
            break;
    }
}

// Finalizar questionário
function finishSurvey() {
    surveyResponses.endTime = new Date();
    
    // Calcular duração
    const durationMs = surveyResponses.endTime - surveyResponses.startTime;
    const durationSeconds = Math.floor(durationMs / 1000);
    
    console.log('Questionário finalizado!');
    console.log('Duração:', durationSeconds, 'segundos');
    console.log('Todas as respostas:', surveyResponses);
    
    // Barra de progresso completa
    updateProgressBar(surveyData.questions.length);
    
    // Salvar respostas em localStorage (opcional)
    localStorage.setItem('surveyResponses', JSON.stringify(surveyResponses));
    
    // Mostrar tela de agradecimento
    questionsContainer.classList.remove('active');
    thankYouScreen.classList.add('active');
    
    // Mostrar resumo das respostas
    displayResponsesSummary();
    
    // Iniciar contador da oferta
    startOfferCountdown();
}

// Função para exibir o resumo das respostas
function displayResponsesSummary() {
    const responsesContainer = document.getElementById('responses-summary');
    responsesContainer.innerHTML = '';
    
    // Obter todas as respostas
    const answers = surveyResponses.answers;
    
    // Para cada questão respondida, criar um item de resumo
    for (const questionId in answers) {
        if (answers.hasOwnProperty(questionId)) {
            const answer = answers[questionId];
            
            const responseItem = document.createElement('div');
            responseItem.classList.add('response-item');
            
            const responseQuestion = document.createElement('div');
            responseQuestion.classList.add('response-question');
            responseQuestion.textContent = answer.questionText;
            
            const responseAnswer = document.createElement('div');
            responseAnswer.classList.add('response-answer');
            
            // Formatar a resposta com base no tipo
            if (Array.isArray(answer.response)) {
                // Respostas múltiplas
                if (answer.response.length === 0) {
                    responseAnswer.textContent = 'Nenhuma opção selecionada';
                } else {
                    const ul = document.createElement('ul');
                    answer.response.forEach(item => {
                        const li = document.createElement('li');
                        li.textContent = item;
                        ul.appendChild(li);
                    });
                    responseAnswer.appendChild(ul);
                }
            } else if (answer.response === '') {
                // Resposta vazia (campo de texto)
                responseAnswer.textContent = 'Não respondido';
            } else if (answer.questionText.includes('avalia')) {
                // Pergunta de avaliação (estrelas)
                const rating = parseInt(answer.response);
                let stars = '';
                for (let i = 1; i <= 5; i++) {
                    if (i <= rating) {
                        stars += '★ ';
                    } else {
                        stars += '☆ ';
                    }
                }
                responseAnswer.textContent = stars + `(${rating} de 5)`;
            } else {
                // Resposta simples
                responseAnswer.textContent = answer.response;
            }
            
            responseItem.appendChild(responseQuestion);
            responseItem.appendChild(responseAnswer);
            responsesContainer.appendChild(responseItem);
        }
    }
    
    // Se não houver respostas, mostrar mensagem
    if (Object.keys(answers).length === 0) {
        const noAnswers = document.createElement('p');
        noAnswers.textContent = 'Nenhuma resposta registrada.';
        responsesContainer.appendChild(noAnswers);
    }
    
    // Personalizar a oferta com base nas respostas (exemplo)
    customizeOffer();
}

// Função para personalizar a oferta com base nas respostas
function customizeOffer() {
    // Pegar a primeira resposta para personalizar (exemplo simples)
    const answers = surveyResponses.answers;
    const firstQuestionId = Object.keys(answers)[0];
    
    if (firstQuestionId) {
        const userType = answers[firstQuestionId].response;
        
        // Definir um ícone personalizado para a oferta com base no tipo de usuário
        let offerIcon = 'fa-rocket';
        let offerTitle = 'Pacote Premium';
        
        // Ajustar oferta com base na resposta
        if (userType === 'Gestor de Tráfego') {
            offerIcon = 'fa-chart-line';
            offerTitle = 'Pacote Traffic Pro';
        } else if (userType === 'Dono de Agência') {
            offerIcon = 'fa-globe';
            offerTitle = 'Pacote Agency Master';
        } else if (userType === 'Dono de Negócio') {
            offerIcon = 'fa-briefcase';
            offerTitle = 'Pacote Business Elite';
        } else if (userType === 'Infoprodutor') {
            offerIcon = 'fa-rocket';
            offerTitle = 'Pacote Creator Pro';
        }
        
        // Atualizar elementos da oferta
        document.querySelector('.offer-icon i').className = `fas ${offerIcon}`;
        document.querySelector('.offer-details h4').textContent = offerTitle;
    }
}

// Função para iniciar o contador da oferta
function startOfferCountdown() {
    const countdownElement = document.getElementById('offer-countdown');
    
    // Definir 15 minutos de contagem regressiva (em segundos)
    let timeLeft = 15 * 60;
    
    function updateCountdown() {
        // Calcular minutos e segundos
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        // Formatar com zero à esquerda se necessário
        const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        // Atualizar elemento na página
        countdownElement.textContent = formattedTime;
        
        // Se o tempo acabar, mostrar mensagem
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            countdownElement.textContent = 'EXPIRADO';
            
            // Opcional: Desabilitar o botão de CTA
            const ctaButton = document.getElementById('cta-button');
            ctaButton.classList.add('expired');
            ctaButton.innerHTML = 'OFERTA EXPIRADA';
            ctaButton.style.backgroundColor = '#999';
            ctaButton.style.pointerEvents = 'none';
        }
        
        // Reduzir o tempo
        timeLeft--;
    }
    
    // Atualizar imediatamente e depois a cada segundo
    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
}

// Função para voltar para a tela anterior
function goToPreviousScreen() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
        updateProgressBar(currentQuestionIndex);
    }
}

// Adicionar evento de clique para o botão CTA
document.getElementById('cta-button').addEventListener('click', function(e) {
    e.preventDefault();
    
    // Mostrar um alerta simples (pode ser substituído por um modal ou redirecionamento real)
    alert('Parabéns! Sua compra está sendo processada. Você será redirecionado para a página de pagamento.');
    
    // Opcional: redirecionar para uma página de checkout
    // window.location.href = 'https://seu-site.com/checkout';
});