import React, { useState } from 'react';
import { ExamRecord } from '../types';

interface DashboardProps {
  onStartReport: (payload: {
    text?: string;
    image?: string;
    images?: string[];
    topic?: string;
    material?: string;
    materialImages?: string[];
  }) => void;
}

const recentRecords: ExamRecord[] = [
  {
    id: '1',
    title: '2023 公务员模拟考试 B 卷',
    category: '行政管理 - 第二部分',
    date: '2023年10月24日',
    time: '14:30',
    score: 78,
    status: 'completed',
    icon: 'description',
    iconColorClass: 'text-primary',
    iconBgClass: 'bg-blue-100',
  },
  {
    id: '2',
    title: '行政法 - 案例分析',
    category: '手写上传',
    date: '2023年10月24日',
    time: '10:15',
    score: null,
    status: 'processing',
    icon: 'image',
    iconColorClass: 'text-purple-600',
    iconBgClass: 'bg-purple-100',
  },
  {
    id: '3',
    title: '宪法论文 #5',
    category: '高级专题',
    date: '2023年10月23日',
    time: '16:45',
    score: 62,
    status: 'completed',
    icon: 'description',
    iconColorClass: 'text-primary',
    iconBgClass: 'bg-blue-100',
  },
];

const Dashboard: React.FC<DashboardProps> = ({ onStartReport }) => {
  const [topic, setTopic] = useState('');
  const [material, setMaterial] = useState('');
  const [materialImages, setMaterialImages] = useState<{ dataUrl: string; name: string }[]>([]);
  const [essayImages, setEssayImages] = useState<{ dataUrl: string; name: string }[]>([]);
  const [essayText, setEssayText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleImagesChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    kind: 'essay' | 'material'
  ) => {
    const files = Array.from(event.target.files ?? []) as File[];
    event.target.value = '';
    if (files.length === 0) {
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      setError(kind === 'essay' ? '请上传图片格式的答卷' : '请上传图片格式的材料');
      return;
    }

    try {
      const items = await Promise.all(
        imageFiles.map(
          (file) =>
            new Promise<{ dataUrl: string; name: string }>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve({ dataUrl: String(reader.result ?? ''), name: file.name });
              reader.onerror = () => reject(new Error('Failed to read file'));
              reader.readAsDataURL(file);
            })
        )
      );

      if (kind === 'essay') {
        setEssayImages((prev) => [...prev, ...items]);
      } else {
        setMaterialImages((prev) => [...prev, ...items]);
      }
      setError(null);
    } catch {
      setError('读取图片失败，请重试');
    }
  };

  const handleStartImageGrading = () => {
    if (essayImages.length === 0) {
      setError('请先选择图片再开始批改');
      return;
    }
    if (!material.trim() && materialImages.length === 0) {
      setError('请先上传材料图片或粘贴材料内容');
      return;
    }
    setError(null);
    onStartReport({
      image: essayImages[0]?.dataUrl,
      images: essayImages.map((item) => item.dataUrl),
      topic: topic.trim() ? topic.trim() : undefined,
      material: material.trim() ? material.trim() : undefined,
      materialImages: materialImages.map((item) => item.dataUrl),
    });
  };

  const handleStartTextGrading = () => {
    if (!essayText.trim()) {
      setError('请先输入作答内容再开始批改');
      return;
    }
    if (!material.trim() && materialImages.length === 0) {
      setError('请先上传材料图片或粘贴材料内容');
      return;
    }
    setError(null);
    onStartReport({
      text: essayText.trim(),
      topic: topic.trim() ? topic.trim() : undefined,
      material: material.trim() ? material.trim() : undefined,
      materialImages: materialImages.map((item) => item.dataUrl),
    });
  };

  const essayFileLabel =
    essayImages.length === 0
      ? null
      : essayImages.length === 1
        ? essayImages[0].name
        : `${essayImages[0].name} 等 ${essayImages.length} 张`;

  return (
    <div className="flex flex-col min-h-screen bg-background-light">
      {/* Header */}
      <header className="bg-white border-b border-[#f0f2f5] px-4 py-3 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-[#101418]">
            <div className="size-8 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined !text-[32px]">school</span>
            </div>
            <h2 className="text-[#101418] text-xl font-bold leading-tight tracking-[-0.015em]">申论 AI 教练</h2>
          </div>
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-6">
              <button className="text-[#101418] text-sm font-medium hover:text-primary transition-colors">首页</button>
              <button className="text-[#5e718d] text-sm font-medium hover:text-primary transition-colors">历史记录</button>
              <button className="text-[#5e718d] text-sm font-medium hover:text-primary transition-colors">账户</button>
            </nav>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-[#101418]">林教官</p>
                <p className="text-[10px] text-[#5e718d]">高级阅卷人</p>
              </div>
              <div 
                className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-primary/20" 
                style={{ backgroundImage: 'url("https://picsum.photos/100/100")' }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-8 flex flex-col gap-8">
        {error && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            {error}
          </div>
        )}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-[#101418] tracking-tight text-3xl md:text-4xl font-bold leading-tight max-w-2xl">
              欢迎回来，教官。<br /> <span className="text-primary">请选择批改方式。</span>
            </h1>
            <p className="text-[#5e718d] mt-3 text-base">请选择如何输入学生作答内容以进行 AI 智能分析。</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[#f0f2f5] p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">题目</label>
                <input
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="请输入题目（可选）"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                />
                <p className="text-[11px] text-gray-500">提示：上传图片批改时，建议同时提供题目和材料，结果更准确。</p>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">材料</label>
                <textarea
                  className="w-full min-h-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="粘贴材料原文（可选：也可以上传材料图片）"
                  value={material}
                  onChange={(event) => setMaterial(event.target.value)}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-700 shadow-sm hover:border-primary hover:text-primary transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[16px]">image</span>
                    上传材料图片
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(event) => handleImagesChange(event, 'material')}
                    />
                  </label>
                  {materialImages.length > 0 && (
                    <span className="text-xs text-gray-500">已选 {materialImages.length} 张</span>
                  )}
                  {materialImages.length > 0 && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-700 shadow-sm hover:border-red-300 hover:text-red-600 transition-colors"
                      onClick={() => setMaterialImages([])}
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      清空
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-500">材料支持“图片 / 文本”二选一；也可同时提供。</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Upload Card */}
            <div className="group relative flex flex-col bg-white rounded-xl shadow-sm border border-transparent hover:border-primary/50 hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary !text-6xl group-hover:scale-110 transition-transform duration-300">upload_file</span>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">AI 识别</span>
                </div>
                <h3 className="text-[#101418] text-xl font-bold mb-2">上传手写试卷 (AI 识别)</h3>
                <p className="text-[#5e718d] text-sm mb-6 flex-1">请将 PDF 或 JPG 文件拖拽至此。系统针对申论标准答题卡手写体进行了专门优化。</p>
                <div className="mt-auto pt-4 border-t border-dashed border-gray-200 flex flex-col gap-3">
                  <label className="w-full flex items-center justify-center gap-2 bg-primary text-white hover:bg-blue-700 active:bg-blue-800 rounded-lg py-2.5 px-4 font-medium transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[20px]">folder_open</span>
                    浏览文件
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(event) => handleImagesChange(event, 'essay')}
                    />
                  </label>
                  {essayFileLabel && (
                    <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
                      <span className="truncate">已选择：{essayFileLabel}</span>
                      <button
                        type="button"
                        className="shrink-0 text-gray-500 hover:text-red-600"
                        onClick={() => setEssayImages([])}
                        title="清空"
                      >
                        清空
                      </button>
                    </div>
                  )}
                  <button
                    className="w-full flex items-center justify-center gap-2 bg-[#101418] text-white hover:bg-[#1f2a37] rounded-lg py-2.5 px-4 font-medium transition-colors"
                    onClick={handleStartImageGrading}
                  >
                    <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                    开始批改
                  </button>
                </div>
              </div>
            </div>

            {/* Paste Text Card */}
            <div className="group relative flex flex-col bg-white rounded-xl shadow-sm border border-transparent hover:border-primary/50 hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-600 !text-6xl group-hover:scale-110 transition-transform duration-300">keyboard</span>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">编辑器</span>
                </div>
                <h3 className="text-[#101418] text-xl font-bold mb-2">粘贴文本批改</h3>
                <p className="text-[#5e718d] text-sm mb-4 flex-1">直接将文字作答内容粘贴至编辑器，即可获得即时 AI 分析与评分报告。</p>
                <textarea
                  className="w-full h-28 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="在此粘贴或输入作答内容..."
                  value={essayText}
                  onChange={(event) => setEssayText(event.target.value)}
                />
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                  <button
                    className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-[#101418] hover:bg-gray-50 rounded-lg py-2.5 px-4 font-medium transition-colors"
                    onClick={handleStartTextGrading}
                  >
                    <span className="material-symbols-outlined text-[20px]">edit_note</span>
                    开始批改
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 mt-8">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[#101418] text-xl font-bold leading-tight">近期批改记录</h2>
            <button className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
              查看全部历史
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-[#f0f2f5] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 text-xs font-semibold tracking-wide text-gray-500 uppercase">试卷标题</th>
                    <th className="p-4 text-xs font-semibold tracking-wide text-gray-500 uppercase w-48">批改时间</th>
                    <th className="p-4 text-xs font-semibold tracking-wide text-gray-500 uppercase w-32">总分</th>
                    <th className="p-4 text-xs font-semibold tracking-wide text-gray-500 uppercase w-32">状态</th>
                    <th className="p-4 text-xs font-semibold tracking-wide text-gray-500 uppercase w-32 text-right">查看报告</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentRecords.map((record) => (
                    <tr key={record.id} className="group hover:bg-blue-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`${record.iconBgClass} ${record.iconColorClass} rounded p-2`}>
                            <span className="material-symbols-outlined text-[20px]">{record.icon}</span>
                          </div>
                          <div>
                            <p className="text-[#101418] text-sm font-medium">{record.title}</p>
                            <p className="text-xs text-gray-500">{record.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-[#101418] text-sm">{record.date}</p>
                        <p className="text-xs text-gray-500">{record.time}</p>
                      </td>
                      <td className="p-4">
                        {record.score !== null ? (
                          <span className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded text-sm font-bold border ${record.score >= 60 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                            {record.score}
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded bg-gray-100 text-gray-500 text-sm font-bold border border-gray-200">--</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`size-2 rounded-full ${record.status === 'completed' ? 'bg-green-500' : 'bg-yellow-400 animate-pulse'}`}></span>
                          <span className="text-sm text-gray-700">{record.status === 'completed' ? '已完成' : '处理中'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          className={`text-sm font-medium ${record.status === 'completed' ? 'text-primary hover:text-blue-700' : 'text-gray-400 cursor-not-allowed'}`}
                          disabled={record.status !== 'completed'}
                          onClick={() => {
                            if (record.status !== 'completed') {
                              return;
                            }
                            setError('历史报告暂未接入，请在上方填写题目/材料并开始批改。');
                          }}
                        >
                          {record.status === 'completed' ? '查看报告' : '分析中...'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">显示 3 / 128 条记录</p>
              <div className="flex gap-2">
                <button className="p-1 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-50" disabled>
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button className="p-1 rounded hover:bg-gray-200 text-[#101418]">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-auto pt-8 pb-4 text-center">
          <p className="text-xs text-gray-400">© 2023 申论 AI 教练。政府认证辅助阅卷系统。</p>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
