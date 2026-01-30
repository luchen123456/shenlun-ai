import { gradeEssay, HttpError } from '../lib/gradeEssay.ts';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const parsed = await gradeEssay(req.body ?? {});
    res.status(200).json(parsed);
  } catch (error: any) {
    const status = typeof error?.status === 'number' ? error.status : error instanceof HttpError ? error.status : 500;
    res.status(status).json({
      error: status >= 500 ? 'Failed to grade essay' : error?.message ?? 'Bad request',
      message: error?.message ?? 'Unknown error',
      details: error?.details,
    });
  }
}
