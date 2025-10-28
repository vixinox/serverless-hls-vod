'use server'

export async function askGpt(prompt: string) {
  const endpoint = process.env.AI_ENDPOINT!;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.AI_API_KEY!}`
      },
      body: JSON.stringify({
        model: "gpt-5",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: `${errData.error?.message || response.statusText}`
      };
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        error: "请检查输入"
      };
    }

    return {
      success: true,
      data: content
    };
  } catch (error) {
    let message;
    if (error instanceof Error)
      message = error.message;
    return {
      success: false,
      error: `调用失败: ${message ?? String(error)}`
    };
  }
}