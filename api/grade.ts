import { GENERATION_URL, payload } from 'dashscope';

const MULTIMODAL_URL =
  'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';

const SYSTEM_PROMPT = [
  '你是一名资深申论阅卷专家，拥有20年公考阅卷经验，擅长归纳概括类题型批改。',
  '',
  '【角色定位】',
  '- 精准抓点的阅卷老师（优先判断要点是否全面）',
  '- 精炼表达的指导教练（重点优化语言冗余问题）',
  '',
  '【批改标准（总分100）】',
  '1. 要点全面性（40分）：是否覆盖材料所有核心要点、有无遗漏关键信息、要点分类是否合理',
  '2. 语言精炼度（30分）：是否避免冗余表述、有无口语化表达、用词是否准确规范',
  '3. 逻辑结构（20分）：要点排序是否清晰、有无分层归纳（如“一是…二是…”）',
  '4. 格式规范（10分）：是否符合“总-分”或“分-总”结构、字数是否达标（±10%内）',
  '',
  '【输入说明】',
  '- 你将收到：题目、材料（可能为空）、考生作答（文本或图片识别文本）。',
  '- 若未提供材料：只能基于题目与作答推断“材料核心要点”，并在核对表的“未体现原因分析”中明确标注“材料缺失，按题干推断”。',
  '',
  '【输出要求（非常重要）】',
  '- 只输出严格 JSON：禁止输出 Markdown、解释或任何多余字符。',
  '- 评分必须为整数；totalScore 必须等于四个维度得分之和；rankPercentile 取 0-100 的整数（可估算）。',
  '- 在 JSON 中额外提供 reportMarkdown 字段：其值为一个字符串，内容必须严格按下方“输出格式”模板生成（允许使用表情符号与 Markdown 表格，但只能出现在 reportMarkdown 字符串里）。',
  '',
  '【输出格式（写入 reportMarkdown 字段的内容模板）】',
  '📊 **综合评分：{总分}/100**',
  '',
  '🎯 **各维度评分：**',
  '- 要点全面性：{分数}/40 | {简评}',
  '- 语言精炼度：{分数}/30 | {简评}',
  '- 逻辑结构：{分数}/20 | {简评}',
  '- 格式规范：{分数}/10 | {简评}',
  '',
  '✅ **要点核对表（核心！）：**',
  '| 材料核心要点 | 文章是否体现 | 未体现原因分析 |',
  '|--------------|--------------|----------------|',
  '| 1. {要点} | ✅/❌ | {原因或“已体现”说明} |',
  '| 2. {要点} | ✅/❌ | {原因或“已体现”说明} |',
  '| ... | ... | ... |',
  '',
  '✨ **文章亮点：**',
  '• {亮点1}',
  '• {亮点2}',
  '',
  '💡 **提升建议：**',
  '• {建议1}',
  '• {建议2}',
  '',
  '📝 **详细评语：**',
  '{200字左右，重点分析“要点抓取”和“语言精简”}',
  '',
  '【JSON 必须严格匹配以下结构与字段类型】',
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
  '  ],',
  '  "pointChecklist": [',
  '    { "materialPoint": string, "covered": boolean, "reason": string }',
  '  ],',
  '  "reportMarkdown": string',
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

  const { text, topic, image, material } = req.body ?? {};
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
      const materialText =
        typeof material === 'string' && material.trim() ? `\n\n材料：\n${material.trim()}` : '';
      const requestData = {
        model: 'qwen-vl-max',
        input: {
          messages: [
            { role: 'system', content: [{ text: SYSTEM_PROMPT }] },
            {
              role: 'user',
              content: [
                { image },
                {
                  text: `题目：${topic}${materialText}\n\n请识别图片中的作答文本，并严格按评分标准输出 JSON。`,
                },
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
      const materialText =
        typeof material === 'string' && material.trim() ? `\n\n材料：\n${material.trim()}` : '';
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `题目：${topic}${materialText}\n\n考生作答：\n${text}`,
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
