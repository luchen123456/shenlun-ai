import React, { useEffect, useMemo, useState } from 'react';
import ScoreRadar from './ScoreRadar';
import { GradeResponse } from '../types';

interface ReportProps {
  onNavigate: (view: 'dashboard' | 'annotation') => void;
  text?: string;
  topic?: string;
  image?: string;
  material?: string;
  wordLimit?: number;
}

const DEFAULT_TOPIC = '数字治理中的公共政策执行创新';
const DEFAULT_TEXT =
  '数字治理背景下，公共政策执行需要更强的协同能力与可验证机制。应以问题导向完善跨部门协作，建设统一的数据标准与共享平台，并通过基层试点形成可复制经验。同时要建立数据伦理与隐私保护机制，确保执行过程既高效又规范。';

const Report: React.FC<ReportProps> = ({ onNavigate, text, topic, image, material, wordLimit }) => {
  const [grade, setGrade] = useState<GradeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  const requestText = text ?? '';
  const requestTopic = topic ?? DEFAULT_TOPIC;
  const requestMaterial = material ?? '';
  const hasImage = Boolean(image);

  useEffect(() => {
    const controller = new AbortController();
    let timer: number | undefined;

    const fetchGrade = async () => {
      if (!hasImage && !requestText) {
        setGrade(null);
        return;
      }
      if (!requestTopic?.trim()) {
        setGrade(null);
        setError('Missing topic');
        return;
      }
      if (!requestMaterial.trim()) {
        setGrade(null);
        setError('Missing material');
        return;
      }
      setLoading(true);
      setError(null);
      setElapsedMs(0);
      const startedAt = Date.now();
      timer = window.setInterval(() => {
        setElapsedMs(Date.now() - startedAt);
      }, 200);
      try {
        const payload = hasImage
          ? { image, topic: requestTopic, material: requestMaterial, wordLimit }
          : { text: requestText, topic: requestTopic, material: requestMaterial, wordLimit };
        const response = await fetch('/api/grade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Grade request failed (${response.status})`);
        }

        const data: GradeResponse = await response.json();
        setGrade(data);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setError(err?.message ?? 'Failed to fetch grade');
        }
      } finally {
        setLoading(false);
        if (timer) {
          window.clearInterval(timer);
        }
      }
    };

    fetchGrade();
    return () => {
      controller.abort();
      if (timer) {
        window.clearInterval(timer);
      }
    };
  }, [requestText, requestTopic, requestMaterial, wordLimit, hasImage, image]);

  const scoreValue = grade?.totalScore ?? 0;
  const rankPercentile = grade?.rankPercentile ?? 0;
  const overview =
    grade?.comments?.map((comment) => `${comment.title}: ${comment.content}`).join(' ') ??
    '请先上传答卷或输入文本，然后点击“开始批改”。';
  const positiveContent = grade?.comments?.find((comment) => comment.type === 'positive')?.content;
  const negativeContent = grade?.comments?.find((comment) => comment.type === 'negative')?.content;

  const positiveBullets = useMemo(() => {
    if (!positiveContent) {
      return [];
    }
    return positiveContent
      .split(/[\n；;。]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3);
  }, [positiveContent]);

  const negativeBullets = useMemo(() => {
    if (!negativeContent) {
      return [];
    }
    return negativeContent
      .split(/[\n；;。]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3);
  }, [negativeContent]);

  const elapsedSeconds = Math.max(0, Math.round(elapsedMs / 100) / 10);
  const progressPercent = loading
    ? Math.min(95, Math.round((elapsedMs / 15000) * 100))
    : grade
      ? 100
      : 0;
  return (
    <div className="flex flex-col min-h-screen bg-background-light">
      {/* Report Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e5e7eb] bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="size-8 text-primary">
            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z" fill="currentColor"></path>
              <path clipRule="evenodd" d="M39.998 35.764C39.9944 35.7463 39.9875 35.7155 39.9748 35.6706C39.9436 35.5601 39.8949 35.4259 39.8346 35.2825C39.8168 35.2403 39.7989 35.1993 39.7813 35.1602C38.5103 34.2887 35.9788 33.0607 33.7095 32.5189C30.9875 31.8691 27.6413 31.4783 24 31.4783C20.3587 31.4783 17.0125 31.8691 14.2905 32.5189C12.0012 33.0654 9.44505 34.3104 8.18538 35.1832C8.17384 35.2075 8.16216 35.233 8.15052 35.2592C8.09919 35.3751 8.05721 35.4886 8.02977 35.589C8.00356 35.6848 8.00039 35.7333 8.00004 35.7388C8.00004 35.739 8 35.7393 8.00004 35.7388C8.00004 35.7641 8.0104 36.0767 8.68485 36.6314C9.34546 37.1746 10.4222 37.7531 11.9291 38.2772C14.9242 39.319 19.1919 40 24 40C28.8081 40 33.0758 39.319 36.0709 38.2772C37.5778 37.7531 38.6545 37.1746 39.3151 36.6314C39.9006 36.1499 39.9857 35.8511 39.998 35.764ZM4.95178 32.7688L21.4543 6.30267C22.6288 4.4191 25.3712 4.41909 26.5457 6.30267L43.0534 32.777C43.0709 32.8052 43.0878 32.8338 43.104 32.8629L41.3563 33.8352C43.104 32.8629 43.1038 32.8626 43.104 32.8629L43.1051 32.865L43.1065 32.8675L43.1101 32.8739L43.1199 32.8918C43.1276 32.906 43.1377 32.9246 43.1497 32.9473C43.1738 32.9925 43.2062 33.0545 43.244 33.1299C43.319 33.2792 43.4196 33.489 43.5217 33.7317C43.6901 34.1321 44 34.9311 44 35.7391C44 37.4427 43.003 38.7775 41.8558 39.7209C40.6947 40.6757 39.1354 41.4464 37.385 42.0552C33.8654 43.2794 29.133 44 24 44C18.867 44 14.1346 43.2794 10.615 42.0552C8.86463 41.4464 7.30529 40.6757 6.14419 39.7209C4.99695 38.7775 3.99999 37.4427 3.99999 35.7391C3.99999 34.8725 4.29264 34.0922 4.49321 33.6393C4.60375 33.3898 4.71348 33.1804 4.79687 33.0311C4.83898 32.9556 4.87547 32.8935 4.9035 32.8471C4.91754 32.8238 4.92954 32.8043 4.93916 32.7889L4.94662 32.777L4.95178 32.7688ZM35.9868 29.004L24 9.77997L12.0131 29.004C12.4661 28.8609 12.9179 28.7342 13.3617 28.6282C16.4281 27.8961 20.0901 27.4783 24 27.4783C27.9099 27.4783 31.5719 27.8961 34.6383 28.6282C35.082 28.7342 35.5339 28.8609 35.9868 29.004Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">申论 AI 助手</h2>
        </div>
        <div className="flex flex-1 justify-end gap-6 items-center">
          <div className="hidden md:flex items-center gap-6">
            <button className="text-sm font-medium hover:text-primary transition-colors">工作台</button>
            <button className="text-sm font-medium hover:text-primary transition-colors">模拟考试</button>
            <button className="text-sm font-medium hover:text-primary transition-colors">历史记录</button>
          </div>
          <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
          <div className="flex items-center gap-3">
            <button className="bg-primary hover:bg-blue-700 transition-colors text-white text-sm font-bold h-9 px-4 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span className="hidden sm:inline">导出 PDF</span>
            </button>
            <div 
              className="bg-center bg-no-repeat bg-cover rounded-full size-9 ring-2 ring-gray-100 cursor-pointer" 
              style={{ backgroundImage: 'url("https://picsum.photos/100/100")' }}
            ></div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row max-w-[1440px] mx-auto min-h-[calc(100vh-65px)]">
        {/* Sidebar */}
        <aside className="w-full lg:w-[360px] lg:fixed lg:h-[calc(100vh-65px)] overflow-y-auto bg-white border-b lg:border-b-0 lg:border-r border-gray-200 z-10 p-6 flex flex-col gap-8 scrollbar-hide">
          <div className="lg:hidden flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">考试结果</h1>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">得分: {scoreValue}</span>
          </div>
          <div className="flex flex-col items-center justify-center relative">
            <div className="relative size-48">
              <svg className="size-full rotate-[-90deg]" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5"></path>
                <path className="text-primary drop-shadow-lg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${scoreValue}, 100`} strokeLinecap="round" strokeWidth="2.5"></path>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-[#101418] tracking-tighter">
                  {grade ? scoreValue : '--'}
                  <span className="text-2xl ml-1">分</span>
                </span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-medium text-primary bg-blue-50 px-4 py-1.5 rounded-full">
                {grade ? `成绩良好，超越 ${rankPercentile}% 考生` : '等待批改结果'}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">能力雷达图</h3>
              <span className="text-xs text-primary font-medium cursor-pointer hover:underline" onClick={() => onNavigate('annotation')}>查看详情</span>
            </div>
            <div className="rounded-xl border border-gray-100 p-4 bg-white shadow-sm relative h-[240px] flex items-center justify-center">
              <ScoreRadar data={grade?.dimensions} />
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-auto pb-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-400">calendar_today</span>
                <span className="text-sm font-medium">考试日期</span>
              </div>
              <span className="text-sm font-bold">2024年10月24日</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-400">description</span>
                <span className="text-sm font-medium">文章字数</span>
              </div>
              <span className="text-sm font-bold">1,240 字</span>
            </div>
            <button className="mt-4 w-full flex items-center justify-center gap-2 text-primary bg-primary/10 hover:bg-primary/20 h-10 rounded-lg font-bold text-sm transition-colors">
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              重新考试
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-[360px] p-4 md:p-8 lg:p-10 flex flex-col gap-8">
          {(loading || error) && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              {loading ? `AI grading in progress... (${elapsedSeconds}s)` : `Grading failed: ${error}`}
            </div>
          )}
          {loading && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-4">
              <div className="flex items-center justify-between text-xs font-medium text-blue-700">
                <span>识别并批改中</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-blue-100">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <p className="mt-2 text-xs text-blue-700/80">
                预计 10-20 秒，已耗时 {elapsedSeconds}s
              </p>
            </div>
          )}
          {hasImage && (
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#101418]">已上传答卷</h3>
                  <p className="text-sm text-gray-500">当前报告基于图片识别结果生成。</p>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <img
                  src={image as string}
                  alt="Uploaded essay"
                  className="max-h-60 w-full object-contain"
                />
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="bg-gray-200 text-xs font-bold px-2 py-1 rounded text-gray-600">公务员考试</span>
              <span className="bg-blue-100 text-xs font-bold px-2 py-1 rounded text-primary">公共政策</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#101418]">深度分析报告</h1>
            <p className="text-gray-500 text-lg max-w-2xl">Topic: {requestTopic}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 size-10 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="material-symbols-outlined text-white">smart_toy</span>
              </div>
              <div>
                <h2 className="text-lg font-bold">AI 智能点评综述</h2>
                <p className="text-sm text-gray-500">针对您答卷的宏观评价</p>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg mb-6 border-l-4 border-blue-500">
              <p className="text-sm md:text-base leading-relaxed text-gray-800">
                <span className="font-bold text-primary">Overview:</span> {overview}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-bold uppercase text-success tracking-wide flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">check_circle</span> 亮点解析
                </h3>
                <ul className="flex flex-col gap-2">
                  {positiveBullets.length > 0 ? (
                    positiveBullets.map((item) => (
                      <li key={item} className="flex gap-3 text-sm items-start">
                        <span className="size-1.5 rounded-full bg-gray-300 mt-2 shrink-0"></span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-400">等待 AI 生成亮点评价</li>
                  )}
                </ul>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-bold uppercase text-warning tracking-wide flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">warning</span> 不足与失分点
                </h3>
                <ul className="flex flex-col gap-2">
                  {negativeBullets.length > 0 ? (
                    negativeBullets.map((item) => (
                      <li key={item} className="flex gap-3 text-sm items-start">
                        <span className="size-1.5 rounded-full bg-gray-300 mt-2 shrink-0"></span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-400">等待 AI 生成改进建议</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold px-1">维度深度分析</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
                <button className="px-6 py-4 text-sm font-bold border-b-2 border-primary text-primary hover:bg-gray-50 transition-colors whitespace-nowrap">
                  观点论证
                </button>
                <button className="px-6 py-4 text-sm font-bold border-b-2 border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors whitespace-nowrap">
                  逻辑脉络
                </button>
                <button className="px-6 py-4 text-sm font-bold border-b-2 border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors whitespace-nowrap">
                  语言表达
                </button>
                <button className="px-6 py-4 text-sm font-bold border-b-2 border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors whitespace-nowrap">
                  卷面结构
                </button>
              </div>
              <div className="p-6 md:p-8 flex flex-col gap-8">
                <div className="flex items-start gap-4">
                  <div className="bg-yellow-50 p-2 rounded-lg text-yellow-600 mt-1">
                    <span className="material-symbols-outlined">lightbulb</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold mb-1">论证深度有待加强</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      您关于“数字鸿沟”的论述在理论上是成立的，但缺乏实际应用层面的探讨。整合2023年数字部门报告中的案例研究将使这一部分从理论走向实践，更具说服力。
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-6 relative">
                  <div className="absolute top-0 right-0 bg-gray-200 text-[10px] font-bold px-2 py-1 rounded-bl-lg text-gray-600 uppercase">第三段节选</div>
                  <p className="font-serif text-lg leading-loose text-gray-800">
                    ……因此，政府必须严格执行数字优先政策。<span 
                      className="bg-yellow-100 text-gray-900 px-1 rounded ring-2 ring-yellow-400/50 cursor-help relative group"
                      onClick={() => onNavigate('annotation')}
                    >
                      然而，这种做法往往忽视了缺乏数字素养的老年人群体。
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs p-3 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 leading-normal font-sans">
                        点评：反驳有力，但此处需要提出具体的解决方案（例如：混合服务中心）。
                        <span className="tooltip-arrow border-t-gray-900"></span>
                      </span>
                    </span> 
                    因此，必须寻求平衡，以确保所有公民无论技术水平如何都能公平地获得服务……
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">具体改进建议</h4>
                  <div className="flex flex-wrap gap-2">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-700 shadow-sm hover:border-primary hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[16px] text-primary">add</span>
                      引用2023年统计数据
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-700 shadow-sm hover:border-primary hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[16px] text-primary">add</span>
                      提及“全渠道服务”
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] rounded-xl p-6 md:p-8 shadow-lg text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/20 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-white/10 p-2 rounded-lg material-symbols-outlined">flag</span>
                  <h2 className="text-xl font-bold">下一步提升建议</h2>
                </div>
                <p className="text-blue-100 mb-6 max-w-lg leading-relaxed">{grade?.advice ?? 'No additional advice.'}</p>
                <button className="bg-white text-[#0f172a] hover:bg-gray-100 font-bold px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2">
                  加入学习计划
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
              <div className="flex-1 w-full bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-5">
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <div className="bg-primary/80 size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">1</div>
                    <div>
                      <h4 className="font-bold text-sm">背诵关键政策数据</h4>
                      <p className="text-xs text-gray-300 mt-1">重点关注数字部门发布的2023年老年人适应率数据。</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="bg-primary/80 size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">2</div>
                    <div>
                      <h4 className="font-bold text-sm">练习逻辑连接词</h4>
                      <p className="text-xs text-gray-300 mt-1">复习“逻辑连接词”模块，使段落过渡更流畅。</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="bg-primary/80 size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">3</div>
                    <div>
                      <h4 className="font-bold text-sm">扩充专业词汇</h4>
                      <p className="text-xs text-gray-300 mt-1">寻找3个“数字化转型”的同义表达以避免重复。</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {grade && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[#101418]">输出结果展示</h2>
                <span className="text-xs text-gray-400">JSON</span>
              </div>
              <pre className="text-xs text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-4 overflow-auto max-h-80">
                {JSON.stringify(grade, null, 2)}
              </pre>
            </div>
          )}
          <div className="mt-8 pt-8 border-t border-gray-200 flex justify-between text-sm text-gray-500">
            <p>© 2024 申论智能批改助手</p>
            <div className="flex gap-4">
              <button className="hover:text-primary">帮助中心</button>
              <button className="hover:text-primary">隐私政策</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Report;
