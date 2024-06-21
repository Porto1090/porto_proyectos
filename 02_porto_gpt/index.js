import { CreateWebWorkerMLCEngine } from "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.46/+esm"

// se pone delante de la variable un $ para indicar que es un elemento del DOM
// luego se usa $ para encapsular el elemento del DOM
const $ = element => document.querySelector(element);
const $form = $('form');
const $input = $('input');
const $template = $('#message-template');
const $messages = $('ul');
const $container= $('main');
const $button = $('button');
const $info = $('small');
const $loading = $('.loading');

let messages = [];
let modelos = ['Phi-3-mini-4k-instruct-q4f32_1-MLC-1k', 'gemma-2b-it-q4f16_1-MLC-1k'];
let end = false;

// Modelo seleccionado
// MODELO PODEROSO [0] - MODELO TERRIBLE [1]
const SELECTED_MODEL = modelos[1];
console.log(`Modelo seleccionado: ${SELECTED_MODEL}`);

const engine = await CreateWebWorkerMLCEngine(
    new Worker('./worker.js', { type: 'module' }),
    SELECTED_MODEL,
    {
        initProgressCallback: (info) => {
            $info.textContent = info.text;
            if(info.progress === 1 && !end){
                end = true;
                $loading?.parentNode?.removeChild($loading)
                $button.removeAttribute('disabled');
                addMessage("¡Hola! Soy un ChatGPT propiedad de Porto que se ejecuta completamente en tu navegador. ¿En qué puedo ayudarte hoy?", 'bot')
                $input.focus();
            }
        }
    }
);

$form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageText = $input.value.trim(); 

    if (messageText != '') {
        // Add user message to the DOM
        $input.value = ''; // Clear input field
        addMessage(messageText, 'user');
        $button.setAttribute('disabled', true);

        const userMessage = {
            role: 'user',
            content: messageText
        };

        messages.push(userMessage);

        try {
            const chunks = await engine.chat.completions.create({
                messages,
                stream: true
            });

            let reply = '';
            const $botMessage= addMessage("", 'bot');

            for await (const chunk of chunks) {
                const [choice] = chunk.choices;
                const content = choice?.delta?.content ?? "";
                reply += content;
                $botMessage.textContent = reply;
            }
            $container.scrollTop = $container.scrollHeight;

            $button.removeAttribute('disabled');
            messages.push({ 
                role: 'assistant', 
                content: reply 
            });
        } catch (error) {
            console.error('Error getting completion:', error);
            $button.removeAttribute('disabled');
            addMessage("Error en el motor de chat. Por favor, intenta nuevamente.", 'bot');
        }
    }
});

function addMessage(text, sender){
    //clonar el template
    const clonedTemplate = $template.content.cloneNode(true);
    const $newMessage = clonedTemplate.querySelector('.message');
    const $who = $newMessage.querySelector('span:first-child');
    const $text = $newMessage.querySelector('span:last-child');

    //modificar el template
    $who.textContent = sender === 'bot' ? 'ChatGPT' : 'Usuario';
    $text.textContent = text;
    $newMessage.classList.add(sender);

    //actualizar el DOM y mover el scroll al final
    $messages.appendChild($newMessage);
    $container.scrollTop = $container.scrollHeight;

    return $text;
}