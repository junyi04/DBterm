import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, FileText } from 'lucide-react';

interface CaseSelectionModalProps {
  userId: number;
  onClose: () => void;
  onCaseSelected: () => void;
}

interface Case {
  case_id: number;
  title: string;
  description: string;
  difficulty: number;
}

export function CaseSelectionModal({ userId, onClose, onCaseSelected }: CaseSelectionModalProps) {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    // TODO: Replace with your actual API endpoint
    // const response = await fetch('YOUR_API_URL/cases');
    // const data = await response.json();
    // setCases(data);

    // Mock data
    const mockCases: Case[] = [
      {
        case_id: 1,
        title: '밀실 살인 사건',
        description: '호텔의 밀실에서 시체가 발견되었다. 창문과 문은 모두 안에서 잠겨있었고, 범인의 흔적은 찾을 수 없었다.',
        difficulty: 5,
      },
      {
        case_id: 2,
        title: '보석 도난 사건',
        description: '박물관에서 귀중한 보석이 사라졌다. CCTV에는 아무것도 찍히지 않았고, 보안 시스템도 정상 작동했다.',
        difficulty: 2,
      },
      {
        case_id: 3,
        title: '독살 사건',
        description: '만찬회에서 한 손님이 갑자기 쓰러졌다. 부검 결과 독극물이 검출되었지만, 누가 어떻게 투여했는지 알 수 없다.',
        difficulty: 4,
      },
      {
        case_id: 4,
        title: '알리바이 트릭',
        description: '살인 사건이 발생했지만, 모든 용의자에게 완벽한 알리바이가 있다. 하지만 범인은 분명 그 중 한 명이다.',
        difficulty: 3,
      },
      {
        case_id: 5,
        title: '연쇄 절도 사건',
        description: '비슷한 수법으로 연쇄 절도가 발생했다. 범인은 항상 귀중품만 정확히 찾아가고, 흔적을 남기지 않는다.',
        difficulty: 1,
      },
    ];
    setCases(mockCases);
  };

  const handleSubmit = async () => {
    if (!selectedCase) return;

    // TODO: Replace with your actual API endpoint
    // await fetch('YOUR_API_URL/active_cases', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     case_id: selectedCase.case_id,
    //     client_id: userId
    //   })
    // });

    onCaseSelected();
  };

  const getDifficultyStars = (difficulty: number) => {
    return '⭐'.repeat(difficulty);
  };

  const getDifficultyLabel = (difficulty: number) => {
    const labels = ['매우 쉬움', '쉬움', '보통', '어려움', '매우 어려움'];
    return labels[difficulty - 1] || '보통';
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-green-500';
    if (difficulty <= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="mb-1">사건 선택</h2>
            <p className="text-sm text-muted-foreground">의뢰할 사건을 선택하세요</p>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="size-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {cases.map((caseItem) => (
            <Card
              key={caseItem.case_id}
              className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                selectedCase?.case_id === caseItem.case_id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedCase(caseItem)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <FileText className="size-5 text-blue-500" />
                  <h3>{caseItem.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getDifficultyColor(caseItem.difficulty)} hover:opacity-90`}>
                    {getDifficultyLabel(caseItem.difficulty)}
                  </Badge>
                  <span className="text-yellow-500">{getDifficultyStars(caseItem.difficulty)}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{caseItem.description}</p>
            </Card>
          ))}
        </div>

        <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-3">
          <Button onClick={onClose} variant="outline">
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedCase}>
            사건 의뢰하기
          </Button>
        </div>
      </Card>
    </div>
  );
}
