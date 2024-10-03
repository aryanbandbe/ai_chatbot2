document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

async function sendMessage() {
  const userInput = document.getElementById('user-input').value.trim();

  // Check if input is empty
  if (!userInput) return;

  // Display user's message
  appendMessage('user', userInput);

  // Clear the input field
  document.getElementById('user-input').value = '';

  // Get chatbot response
  try {
    const botResponse = await getChatbotResponse(userInput);
    // Display chatbot's response only if it's valid
    if (botResponse) {
      appendMessage('bot', botResponse);
    } else {
      appendMessage('bot', 'Sorry, I could not generate a response.');
    }
  } catch (error) {
    console.error("Error:", error);
    appendMessage('bot', 'Sorry, there was an error processing your request. Please try again later.');
  }
}

function appendMessage(sender, message) {
  const chatBox = document.getElementById('chat-box');

  // Create a new message element
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender);
  messageElement.innerHTML = `<p>${message}</p>`;

  // Append the message element to the chat box
  chatBox.appendChild(messageElement);

  // Scroll chat to the bottom to show the latest message
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function getChatbotResponse(userMessage) {
  const API_URL = 'https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-2.7B';  // Updated model URL
  const API_TOKEN = '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';  // Replace with your actual Hugging Face API key

  const headers = {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
  };

  const body = JSON.stringify({
    inputs: userMessage,  // Sending the user input as a string
    parameters: {
      max_new_tokens: 50,  // Adjust the number of tokens (length of response)
    },
  });

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: headers,
      body: body,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Ensure we return only a single response and handle it properly
    if (data && Array.isArray(data) && data.length > 0) {
      const generatedText = data[0].generated_text || 'Sorry, I could not generate a response.';
      return generatedText.trim();  // Return the generated text after trimming whitespace
    } else {
      return 'Sorry, I could not generate a response.';
    }
  } catch (error) {
    console.error('Error fetching chatbot response:', error);
    throw new Error('Failed to fetch response from the chatbot.');
  }
}
