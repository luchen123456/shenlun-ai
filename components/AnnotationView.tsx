import React from 'react';

interface AnnotationViewProps {
  onClose: () => void;
}

const AnnotationView: React.FC<AnnotationViewProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="relative w-full max-w-[1440px] h-[92vh] flex flex-col bg-background-light rounded-xl shadow-2xl border border-gray-200 overflow-hidden ring-1 ring-white/10">
        
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[24px]">compare_arrows</span>
            </div>
            <div>
              <h2 className="text-[#111418] text-lg font-bold leading-tight tracking-tight">原文对照与 AI 批注</h2>
              <p className="text-xs text-gray-500 font-medium">申论模拟卷 #20231027-A • 考生ID: 893021</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="group flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">close</span>
          </button>
        </header>

        {/* Main Split View Content */}
        <main className="flex flex-1 overflow-hidden relative">
          
          {/* Left Panel: Original Answer */}
          <div className="w-1/2 flex flex-col border-r border-gray-200 bg-gray-50 min-w-[400px]">
            {/* ToolBar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shadow-sm z-10">
              <h3 className="text-gray-700 font-bold text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400 text-[18px]">image</span>
                原始答卷
              </h3>
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                <button className="p-1.5 text-gray-600 hover:text-primary hover:bg-white rounded-md transition-all shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                </button>
                <button className="p-1.5 text-gray-600 hover:text-primary hover:bg-white rounded-md transition-all">
                  <span className="material-symbols-outlined text-[18px]">zoom_out</span>
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <button className="p-1.5 text-gray-600 hover:text-primary hover:bg-white rounded-md transition-all">
                  <span className="material-symbols-outlined text-[18px]">crop_free</span>
                </button>
              </div>
            </div>
            
            {/* Image Area */}
            <div className="flex-1 overflow-auto custom-scrollbar p-8 flex justify-center bg-gray-100 relative">
              <div className="relative w-full max-w-[640px] shadow-xl transition-transform duration-200 ease-in-out">
                <div className="w-full bg-white relative overflow-hidden" style={{ paddingBottom: '141.4%' }}>
                  <div 
                    className="absolute inset-0 bg-contain bg-center bg-no-repeat" 
                    style={{ 
                      backgroundImage: "url('https://picsum.photos/640/905')", 
                      opacity: 0.95 
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-gray-200/20 pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: AI Annotation */}
          <div className="w-1/2 flex flex-col bg-white min-w-[400px]">
            {/* ToolBar */}
            <div className="flex items-center justify-between px-6 py-2 border-b border-gray-200 bg-white z-10 shadow-sm">
              <h3 className="text-primary font-bold text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                AI 深度批注
              </h3>
              <div className="flex gap-4 text-xs font-semibold text-gray-500">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-50 border border-gray-100">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]"></span> 
                  论证不足
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-50 border border-gray-100">
                  <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]"></span> 
                  逻辑漏洞
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-50 border border-gray-100">
                  <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span> 
                  表达亮点
                </div>
              </div>
            </div>

            {/* Text Content Area */}
            <div className="flex-1 overflow-auto custom-scrollbar p-8 md:p-12 relative">
              <div className="max-w-[700px] mx-auto">
                <div className="text-center mb-10">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">以“水”为师，涵养为政之德</h1>
                  <div className="h-1 w-12 bg-primary mx-auto rounded-full opacity-30"></div>
                </div>
                
                <div className="text-[17px] leading-9 text-gray-700 space-y-8 font-serif text-justify tracking-wide">
                  <p>
                    “上善若水，水利万物而不争。”水之德，在于其包容、坚韧与清廉。对于新时代的公职人员而言，应当以水为师，从水中汲取智慧与力量，不断涵养为政之德，方能更好地服务人民，推动社会进步。
                  </p>
                  
                  <p>
                    <span className="relative group cursor-pointer inline">
                      <span className="bg-green-50 border-b-[2px] border-green-400/50 pb-0.5 group-hover:bg-green-100 transition-colors rounded-sm px-1 -mx-1">
                        首先，要学习水“海纳百川”的包容精神。
                      </span>
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col w-64 p-3 bg-white rounded-lg shadow-xl border border-gray-100 z-50 text-sm">
                        <span className="flex items-center gap-2 font-bold text-green-600 mb-1">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span> 表达亮点
                        </span>
                        <span className="text-gray-600 text-xs leading-relaxed">引用恰当，开头观点鲜明，起到了很好的总领作用。</span>
                        <span className="tooltip-arrow border-t-white"></span>
                      </span>
                    </span>
                    在工作中，我们面对的是千差万别的群众诉求和错综复杂的社会矛盾。只有像大海一样，能够容纳百川，才能听得进逆耳忠言，容得下不同意见，从而做出更加科学、民主的决策。
                  </p>
                  
                  <p className="relative">
                    <span className="relative group cursor-pointer inline">
                      <span className="bg-yellow-50 border-b-[2px] border-yellow-400/50 pb-0.5 group-hover:bg-yellow-100 transition-colors rounded-sm px-1 -mx-1">
                        其次，要学习水“滴水穿石”的坚韧品质。当前，改革已进入深水区，剩下的都是难啃的硬骨头。
                      </span>
                      {/* Floating suggestion box */}
                      <span className="absolute z-40 right-[-340px] top-0 w-[300px] bg-white rounded-xl shadow-lg border border-yellow-200 overflow-hidden hidden xl:block animate-fade-in">
                        <span className="block h-1.5 w-full bg-yellow-400"></span>
                        <span className="block p-4">
                          <span className="flex justify-between items-start mb-2">
                            <span className="flex items-center gap-2">
                              <span className="bg-yellow-100 text-yellow-700 p-1 rounded">
                                <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                              </span>
                              <span className="font-bold text-sm text-gray-900">论证建议</span>
                            </span>
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">AI Suggestion</span>
                          </span>
                          <span className="block text-sm text-gray-600 leading-relaxed mb-4">
                            此处提到“硬骨头”，但未结合具体的社会热点或政策案例进行展开，论证显得略为空泛。建议结合“乡村振兴”或“基层减负”的具体案例进行深化。
                          </span>
                          <span className="block bg-gray-50 rounded p-3 mb-3 border border-gray-100">
                            <span className="block text-xs font-bold text-gray-500 mb-1">推荐案例:</span>
                            <span className="block text-xs text-primary truncate">《关于进一步深化改革促进乡村医疗卫生体系...》</span>
                          </span>
                          <span className="flex justify-end gap-2">
                            <button className="text-xs font-semibold text-gray-400 hover:text-gray-600 px-2 py-1">忽略</button>
                            <button className="text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded transition-colors">采用建议</button>
                          </span>
                        </span>
                      </span>
                    </span>
                    唯有具备滴水穿石的毅力和韧劲，不畏艰难，锲而不舍，才能攻坚克难，将改革进行到底。如果遇到困难就退缩，遇到挫折就放弃，那么任何事业都将一事无成。
                  </p>
                  
                  <p>
                    <span className="relative group cursor-pointer inline">
                      <span className="bg-red-50 border-b-[2px] border-red-400/50 pb-0.5 group-hover:bg-red-100 transition-colors rounded-sm px-1 -mx-1">
                        最后，要学习水“虽浊流而自清”的廉洁本色。
                      </span>
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col w-64 p-3 bg-white rounded-lg shadow-xl border border-gray-100 z-50 text-sm">
                        <span className="flex items-center gap-2 font-bold text-red-500 mb-1">
                          <span className="material-symbols-outlined text-[16px]">error</span> 逻辑提示
                        </span>
                        <span className="text-gray-600 text-xs leading-relaxed">过渡稍显生硬，建议增加承上启下的连接词。</span>
                        <span className="tooltip-arrow border-t-white"></span>
                      </span>
                    </span>
                    身处复杂的社会环境，诱惑无处不在。公职人员要像莲花一样出淤泥而不染，时刻保持清醒的头脑，筑牢拒腐防变的思想防线，做到清清白白做人，干干净净做事。
                  </p>
                </div>
                <div className="h-20"></div>
              </div>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="px-6 py-4 bg-white border-t border-gray-200 shrink-0 flex items-center justify-between z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm text-gray-500">
              <span className="material-symbols-outlined text-[18px] mr-2">analytics</span>
              <span>AI 置信度: <span className="text-green-600 font-bold">96%</span></span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="material-symbols-outlined text-[18px] mr-2">schedule</span>
              <span>耗时: 45秒</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex items-center justify-center px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-200"
            >
              取消
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-md hover:shadow-lg transition-all focus:ring-4 focus:ring-primary/20">
              <span className="material-symbols-outlined text-[20px]">file_download</span>
              导出完整报告
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AnnotationView;