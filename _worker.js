/**
 * Cloudflare Worker для защиты свадебного планера паролем
 * Сохрани как _worker.js в корне репо
 */

const PASSWORD = "awx2kdh8QWD6rjk!whg";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Если это POST запрос с проверкой пароля
    if (request.method === "POST") {
      try {
        const data = await request.json();
        const { password } = data;

        if (password === PASSWORD) {
          // Пароль правильный!
          return new Response(
            JSON.stringify({
              success: true,
              message: "Пароль верный!"
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "Set-Cookie": `auth_token=valid; Path=/; Max-Age=86400; SameSite=Lax`,
              }
            }
          );
        } else {
          // Пароль неправильный
          return new Response(
            JSON.stringify({
              success: false,
              message: "Неправильный пароль"
            }),
            {
              status: 401,
              headers: {
                "Content-Type": "application/json"
              }
            }
          );
        }
      } catch (err) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Ошибка сервера"
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }
    }

    // Для GET запросов проверяем авторизацию
    if (request.method === "GET") {
      const cookies = request.headers.get("Cookie") || "";
      const hasValidToken = cookies.includes("auth_token=valid");

      if (!hasValidToken) {
        // Не авторизован - показываем форму пароля
        return new Response(getPasswordPage(), {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8"
          }
        });
      }
    }

    // Если авторизован - показываем основной контент (index.html)
    return env.ASSETS.fetch(request);
  }
};

function getPasswordPage() {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Misha & Nastya · Big Day & Beyond</title>
<style>
  :root {
    --bg: #faf8f5;
    --card: #ffffff;
    --primary: #f4a895;
    --accent: #ffa07a;
    --text: #3d2f2b;
    --text-light: #6b5a52;
    --border: #e8dfd8;
    --shadow: 0 8px 24px rgba(244, 168, 149, 0.12);
  }
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { 
    background: var(--bg); 
    color: var(--text); 
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    line-height: 1.5;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .password-container {
    background: var(--card);
    border-radius: 20px;
    padding: 60px 40px;
    box-shadow: var(--shadow);
    max-width: 420px;
    width: 90%;
    text-align: center;
  }
  
  .password-header {
    margin-bottom: 30px;
  }
  
  .heart {
    font-size: 48px;
    margin-bottom: 15px;
    display: block;
  }
  
  h1 {
    font-size: 32px;
    font-weight: 300;
    color: var(--primary);
    margin-bottom: 10px;
    letter-spacing: 1px;
  }
  
  .subtitle {
    font-size: 14px;
    color: var(--text-light);
    margin-bottom: 30px;
  }
  
  .password-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  input[type="password"] {
    padding: 14px 16px;
    border: 2px solid var(--border);
    border-radius: 10px;
    font-size: 16px;
    font-family: inherit;
    transition: all 0.3s;
  }
  
  input[type="password"]:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(244, 168, 149, 0.1);
  }
  
  button {
    padding: 14px 24px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  button:hover {
    background: var(--accent);
    transform: translateY(-2px);
    box-shadow: var(--shadow);
  }
  
  button:active {
    transform: translateY(0);
  }
  
  .error {
    color: #dc2626;
    font-size: 13px;
    margin-top: 10px;
    display: none;
  }
  
  .error.show {
    display: block;
  }
  
  .info {
    font-size: 12px;
    color: var(--text-light);
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
  }
  
  .loading {
    display: none;
    text-align: center;
  }
  
  .spinner {
    border: 3px solid var(--border);
    border-top: 3px solid var(--primary);
    border-radius: 50%;
    width: 24px;
    height: 24px;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 10px;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .form-content {
    display: block;
  }
  
  .form-content.hidden {
    display: none;
  }
</style>
</head>
<body>

<div class="password-container">
  <div class="password-header">
    <span class="heart">💕</span>
    <h1>Misha & Nastya</h1>
    <p class="subtitle">Big Day & Beyond</p>
  </div>
  
  <div class="form-content">
    <form class="password-form" id="password-form">
      <input 
        type="password" 
        id="password-input" 
        placeholder="Введи пароль..." 
        autocomplete="off"
        required
      >
      <button type="submit">🔓 Открыть планер</button>
      <div class="error" id="error-msg">❌ Неправильный пароль</div>
    </form>
  </div>
  
  <div class="loading" id="loading">
    <div class="spinner"></div>
    <p>Загружаю...</p>
  </div>
  
  <div class="info">
    💡 Используется защита через Cloudflare Workers
  </div>
</div>

<script>
  const form = document.getElementById('password-form');
  const input = document.getElementById('password-input');
  const errorMsg = document.getElementById('error-msg');
  const loading = document.getElementById('loading');
  const formContent = document.querySelector('.form-content');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const password = input.value;
    
    formContent.classList.add('hidden');
    loading.style.display = 'block';
    errorMsg.classList.remove('show');
    
    try {
      const response = await fetch(window.location.href, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        window.location.reload();
      } else {
        formContent.classList.remove('hidden');
        loading.style.display = 'none';
        errorMsg.classList.add('show');
        input.value = '';
        input.focus();
      }
    } catch (err) {
      console.error('Ошибка:', err);
      formContent.classList.remove('hidden');
      loading.style.display = 'none';
      errorMsg.textContent = '❌ Ошибка подключения';
      errorMsg.classList.add('show');
    }
  });
  
  input.focus();
</script>

</body>
</html>`;
}
