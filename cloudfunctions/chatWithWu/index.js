const cloud = require('wx-server-sdk');
const axios = require('axios');
const { SYSTEM_PROMPT } = require('./prompt');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  const { messages = [] } = event;

  if (!Array.isArray(messages) || messages.length === 0) {
    return { success: false, error: '消息不能为空' };
  }

  const recentMessages = messages.slice(-20);

  const finalMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...recentMessages
  ];

  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: finalMessages,
        temperature: 0.85,
        max_tokens: 400,
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        timeout: 30000
      }
    );

    const reply = response.data.choices[0].message.content;

    return {
      success: true,
      reply: reply,
      usage: response.data.usage
    };
  } catch (err) {
    console.error('DeepSeek API 调用失败:', err.message);
    return {
      success: false,
      error: '吴先生暂时走开了一会儿，请稍后再试',
      detail: err.message
    };
  }
};