import { GENERATION_URL, payload } from 'dashscope';

const MULTIMODAL_URL =
  'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';

const SYSTEM_PROMPT = [
  '你是一名具有20年经验的申论阅卷组长。',
  '请基于题目与考生作答进行评分与点评。',
  '当输入为图片时，先识别手写内容再进行批改。',
  '只输出严格 JSON，禁止输出 Markdown、解释或多余字符。',
  'JSON 必须严格匹配以下结构与字段类型：',
  '{',
  '  "totalScore": number,',
  '  "rankPercentile": number,',
  '  "dimensions": [',
  '    { "subject": string, "A": number, "fullMark": number }',
  '  ],',
  '  "comments": [',
  '    { "title": string, "content": string, "type": "positive" | "negative" }',
  '  ],',
  '  "advice": string,',
  '  "annotations": [',
  '    { "originalText": string, "comment": string }',
  '  ]',
  '}',
].join('\n');

const extractJson = (content: string) => {
  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }
  return content.slice(start, end + 1);
};

const normalizeContent = (content: any) => {
  if (!content) {
    return '';
  }
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    const textItem = content.find((item) => typeof item?.text === 'string');
    return textItem?.text ?? '';
  }
  return '';
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!process.env.DASHSCOPE_API_KEY) {
    res.status(500).json({ error: 'Missing DASHSCOPE_API_KEY' });
    return;
  }

  const { text, topic, image } = req.body ?? {};
  if (!topic) {
    res.status(400).json({ error: 'Missing topic' });
    return;
  }
  if (!text && !image) {
    res.status(400).json({ error: 'Missing text or image' });
    return;
  }

  try {
    let response: any;
    if (image) {
      const requestData = {
        model: 'qwen-vl-max',
        input: {
          messages: [
            { role: 'system', content: [{ text: SYSTEM_PROMPT }] },
            {
              role: 'user',
              content: [
                { image },
                { text: `题目：${topic}\n\n请识别图片中的作答并进行批改。` },
              ],
            },
          ],
        },
        parameters: {
          result_format: 'message',
        },
      };
      response = await payload(MULTIMODAL_URL, requestData);
    } else {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `题目：${topic}\n\n考生作答：\n${text}`,
        },
      ];
      const requestData = {
        model: 'qwen-max',
        input: { messages },
        parameters: {
          temperature: 0.2,
        },
      };
      response = await payload(GENERATION_URL, requestData);
    }

    const content = normalizeContent(
      response?.output?.choices?.[0]?.message?.content ?? response?.output?.text
    );

    const jsonText = extractJson(content);
    if (!jsonText) {
      res.status(502).json({ error: 'Invalid model response', raw: content });
      return;
    }

    const parsed = JSON.parse(jsonText);
    res.status(200).json(parsed);
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to grade essay',
      message: error?.message ?? 'Unknown error',
    });
  }
}
