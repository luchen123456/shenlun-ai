import type { IncomingMessage, ServerResponse } from 'http';
import { gradeEssay } from '../lib/gradeEssay.ts';

type ProgressEvent = {
  stage:
    | 'received'
    | 'validating'
    | 'calling_model'
    | 'model_responded'
    | 'parsing'
    | 'done'
    | 'error';
  percent: number;
  message: string;
};

const writeSse = (res: ServerResponse, event: string, data: any) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

export default async function handler(req: IncomingMessage & { method?: string; body?: any }, res: ServerResponse & any) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  const sendProgress = (event: ProgressEvent) => writeSse(res, 'progress', event);

  try {
    sendProgress({ stage: 'received', percent: 5, message: '已接收请求' });
    sendProgress({ stage: 'validating', percent: 10, message: '校验输入中' });

    sendProgress({ stage: 'calling_model', percent: 30, message: '调用模型中' });
    const result = await gradeEssay((req as any).body ?? {});
    sendProgress({ stage: 'model_responded', percent: 80, message: '模型已返回' });

    sendProgress({ stage: 'parsing', percent: 90, message: '整理输出中' });
    writeSse(res, 'result', result);
    sendProgress({ stage: 'done', percent: 100, message: '批改完成' });
    res.end();
  } catch (error: any) {
    const message = error?.message ?? 'Unknown error';
    sendProgress({ stage: 'error', percent: 100, message: '批改失败' });
    writeSse(res, 'error', { message, details: error?.details, status: error?.status });
    res.end();
  }
}
