import { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, FileText, Loader2 } from 'lucide-react'; // 🚨 Loader2 추가
import axios from 'axios'; // 🚨 axios 추가
import { toast } from 'sonner'; // 🚨 toast 추가

const apiClient = axios.create({ baseURL: '/api', withCredentials: true });

interface CaseSelectionModalProps {
    userId: number;
    onClose: () => void;
    onCaseSelected: () => void;
}

// 🚨 Case 인터페이스 수정 (카멜 케이스 통일)
interface Case {
    caseId: number; // case_id -> caseId
    title: string;
    description: string;
    difficulty: number;
}

export function CaseSelectionModal({ userId, onClose, onCaseSelected }: CaseSelectionModalProps) {
    const [cases, setCases] = useState<Case[]>([]);
    const [selectedCase, setSelectedCase] = useState<Case | null>(null);
    const [loading, setLoading] = useState(true); // 🚨 로딩 상태
    const [submitting, setSubmitting] = useState(false); // 🚨 제출 상태
    const [error, setError] = useState<string | null>(null);

    // 🚨 1. 사건 목록 조회 API 연동 (STATUS='등록' 상태의 사건)
    const fetchCases = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // GET /api/cases/available 호출
            const response = await apiClient.get<Case[]>('/cases/available');
            setCases(response.data);
        } catch (err: any) {
            setError("의뢰 가능한 사건 목록을 불러오지 못했습니다.");
            toast.error("사건 목록 로드 실패!");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCases();
    }, [fetchCases]);

    // 🚨 2. 사건 의뢰 제출 API 연동
    const handleSubmit = async () => {
        if (!selectedCase || submitting) return;

        setSubmitting(true);
        setError(null);

        try {
            // POST /api/case/start 호출
            const response = await apiClient.post('/case/start', {
                caseId: selectedCase.caseId, // 카멜 케이스 사용
                clientId: userId
            });

            toast.success(`'${selectedCase.title}' 사건 의뢰가 시작되었습니다.`);
            
            // 🚨 성공 시 대시보드 갱신 및 모달 닫기
            onCaseSelected(); 
            onClose();

        } catch (err: any) {
            const errorMessage = err.response?.data?.error || "사건 의뢰 중 오류가 발생했습니다.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
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
                <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
                    <div>
                        <h2 className="mb-1">사건 선택</h2>
                        <p className="text-sm text-muted-foreground">의뢰할 사건을 선택하세요</p>
                    </div>
                    <Button onClick={onClose} variant="ghost" size="sm" disabled={submitting}>
                        <X className="size-4" />
                    </Button>
                </div>

                <div className="p-6 space-y-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-40 text-blue-500">
                            <Loader2 className="animate-spin size-6 mr-2" /> 사건 목록 로딩 중...
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 p-4 border border-red-300 rounded">{error}</div>
                    ) : cases.length === 0 ? (
                        <div className="text-center text-muted-foreground p-4">현재 의뢰 가능한 사건이 없습니다.</div>
                    ) : (
                        cases.map((caseItem) => (
                            <Card
                                key={caseItem.caseId} // 🚨 case_id -> caseId
                                className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                                    selectedCase?.caseId === caseItem.caseId // 🚨 case_id -> caseId
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
                        ))
                    )}
                </div>

                <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-3">
                    <Button onClick={onClose} variant="outline" disabled={submitting}>
                        취소
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={!selectedCase || submitting}
                    >
                        {submitting ? (
                            <><Loader2 className="size-4 mr-2 animate-spin" /> 의뢰 중</>
                        ) : (
                            '사건 의뢰하기'
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
}