import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { RadarData } from '../types';

interface ScoreRadarProps {
  data?: RadarData[];
}

const ScoreRadar: React.FC<ScoreRadarProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[240px] flex items-center justify-center text-sm text-gray-400">
        暂无评分数据
      </div>
    );
  }

  return (
    <div className="w-full h-[240px] min-h-[240px] min-w-[240px] relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={200}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 'bold' }}
          />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#0056D2"
            strokeWidth={2}
            fill="#0056D2"
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreRadar;
