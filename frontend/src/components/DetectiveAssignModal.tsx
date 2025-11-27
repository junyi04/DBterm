import { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, Search, TrendingUp, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const apiClient = axios.create({ baseURL: '/api', withCredentials: true });

// ActiveCase/PendingCase에서 변환되어 넘어온 CaseData (경찰 ID는 PoliceDashboard에서 받아야 함)
interface CaseData {
    activeId: number; 
    caseId: number; 
    caseTitle: string;
    caseDescription: string;
    difficulty: number;
}

// 🚨 백엔드 AppUser 엔티티 (랭킹 정보 포함)에 맞춰 DTO 정의 필요
interface Detective {
    userId: number; // 탐정 ID
    nickname: string;
    score: number;
    totalCases: number; // 백엔드에서 계산되어 넘어옴
    successRate: number; // 백엔드에서 계산되어 넘어옴
    rank: number; // 백엔드에서 계산되어 넘어옴
}

interface DetectiveAssignModalProps {
    caseData: CaseData;
    policeId: number; // 🚨 경찰 ID를 받도록 수정
    onClose: () => void;
    onDetectiveAssigned: () => void;
}

export function DetectiveAssignModal({ caseData, policeId, onClose, onDetectiveAssigned }: DetectiveAssignModalProps) {
    const [detectives, setDetectives] = useState<Detective[]>([]);
    const [selectedDetective, setSelectedDetective] = useState<Detective | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 🚨 1. 탐정 목록 조회 API 연동
    const fetchDetectives = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // GET /api/ranking/detectives 호출 (백엔드에 구현 필요 - 역할='탐정'인 사용자 목록)
            const response = await apiClient.get<Detective[]>('/ranking/detectives'); 
            setDetectives(response.data);
        } catch (err: any) {
            setError("탐정 목록을 불러오지 못했습니다.");
            toast.error("탐정 목록 로드 실패!");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDetectives();
    }, [fetchDetectives]);

    // 🚨 2. 탐정 배정 요청 API 연동
    const handleAssign = async () => {
        if (!selectedDetective || submitting) return;
        setSubmitting(true);
        setError(null);

        try {
            // POST /api/cases/assign 호출 (백엔드에서 상태 변경 및 점수 부여 처리)
            await apiClient.post('/cases/assign', {
                caseId: caseData.caseId, 
                policeId: policeId, // 🚨 경찰 ID 전송
                detectiveId: selectedDetective.userId, // 선택된 탐정 ID 전송
            });

            toast.success(`${selectedDetective.nickname} 탐정에게 사건을 성공적으로 배정했습니다!`);
            onDetectiveAssigned(); // 대시보드 갱신
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || "탐정 배정 중 서버 오류가 발생했습니다.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const getDifficultyStars = (difficulty: number) => {
        return '⭐'.repeat(difficulty);
    };

    const getRankBadge = (rank: number) => {
        if (rank <= 3) return <Badge className="bg-purple-500">상위 {rank}위</Badge>;
        if (rank <= 10) return <Badge variant="secondary">상위 {rank}위</Badge>;
        return <Badge variant="outline">{rank}위</Badge>;
    };

    const getSuccessRateColor = (rate: number) => {
        if (rate >= 85) return 'text-green-600';
        if (rate >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-6 z-10">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h2>탐정 배정</h2>
                                <span className="text-yellow-500">{getDifficultyStars(caseData.difficulty)}</span>
                            </div>
                            <h3 className="mb-1">{caseData.caseTitle}</h3>
                            <p className="text-sm text-muted-foreground">{caseData.caseDescription}</p>
                        </div>
                        <Button onClick={onClose} variant="ghost" size="sm" disabled={submitting}>
                            <X className="size-4" />
                        </Button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="mb-4">
                        <h3 className="mb-2">사용 가능한 탐정</h3>
                        <p className="text-sm text-muted-foreground">
                            탐정을 선택하여 사건을 배정하세요. 성공률과 경험을 참고하세요.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-48 text-purple-500">
                            <Loader2 className="animate-spin size-6 mr-2" /> 탐정 목록 로딩 중...
                        </div>
                    ) : error ? (
                         <div className="text-center text-red-500 p-4 border border-red-300 rounded">{error}</div>
                    ) : (
                        <div className="space-y-3">
                            {detectives.map((detective) => (
                                <Card
                                    key={detective.userId}
                                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                                        selectedDetective?.userId === detective.userId
                                            ? 'ring-2 ring-purple-500 bg-purple-50'
                                            : 'hover:bg-gray-50'
                                    }`}
                                    onClick={() => setSelectedDetective(detective)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <Search className="size-8 text-purple-500 p-1.5 bg-purple-100 rounded-full" />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3>{detective.nickname}</h3>
                                                    {getRankBadge(detective.rank)}
                                                </div>
                                                <div className="flex gap-4 text-sm text-muted-foreground">
                                                    <span>해결 사건: {detective.totalCases}건</span>
                                                    <span className={`flex items-center gap-1 font-medium ${getSuccessRateColor(detective.successRate)}`}>
                                                        <TrendingUp className="size-3" />
                                                        성공률: {detective.successRate.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-3">
                    <Button onClick={onClose} variant="outline" disabled={submitting}>
                        취소
                    </Button>
                    <Button 
                        onClick={handleAssign} 
                        disabled={!selectedDetective || submitting}
                        className="bg-green-500 hover:bg-green-600"
                    >
                        {submitting ? (
                            <><Loader2 className="size-4 mr-2 animate-spin" /> 배정 중</>
                        ) : (
                            '탐정 배정'
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
}