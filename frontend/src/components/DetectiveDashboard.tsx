import { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LogOut, Search, Trophy, Eye, Loader2 } from 'lucide-react';
import type { User } from '../App';
import { InvestigationModal } from './InvestigationModal';
import { CaseResultModal } from './CaseResultModal';
import axios from 'axios';
import { toast } from 'sonner';

const apiClient = axios.create({ baseURL: '/api', withCredentials: true });

interface DetectiveDashboardProps {
    user: User;
    onLogout: () => void;
    onShowRanking: () => void;
}

// 🚨 수정된 AssignedCase 인터페이스
// 백엔드 DTO에 맞게 Camel Case 및 구조 수정 (ClientCaseDTO와 유사)
interface AssignedCase {
    activeId: number;
    caseId: number; 
    caseTitle: string;
    caseDescription: string;
    clientNickname: string;
    policeNickname: string;
    status: string; // '배정', '추리 완료'
    culpritGuess: string | null;
    result: '감사' | '부고' | null;
    difficulty: number;
    actualCulprit: string; // 결과 확인 모달을 위해 필요
}

export function DetectiveDashboard({ user, onLogout, onShowRanking }: DetectiveDashboardProps) {
    const [assignedCases, setAssignedCases] = useState<AssignedCase[]>([]);
    const [selectedCase, setSelectedCase] = useState<AssignedCase | null>(null);
    const [viewResultCase, setViewResultCase] = useState<AssignedCase | null>(null);
    const [loading, setLoading] = useState(true);

    // 🚨 API 호출 함수 (user.id 기반으로 조회)
    const fetchAssignedCases = useCallback(async () => {
        setLoading(true);
        try {
            // GET /api/cases/detective/{userId} API 호출
            const response = await apiClient.get<AssignedCase[]>(`/cases/detective/${user.id}`);
            setAssignedCases(response.data);
        } catch (err: any) {
            toast.error("배정된 사건 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => {
        fetchAssignedCases();
    }, [fetchAssignedCases]);

    const handleInvestigate = (caseItem: AssignedCase) => {
        setSelectedCase(caseItem);
    };

    const handleInvestigationComplete = () => {
        setSelectedCase(null);
        fetchAssignedCases(); // 추리 제출 후 목록 갱신
    };

    const getDifficultyStars = (difficulty: number) => {
        return '⭐'.repeat(difficulty);
    };

    const getResultBadge = (result: string | null) => {
        if (!result) return null;
        if (result === '감사') {
            return <Badge className="bg-green-500 hover:bg-green-600">사건 해결 성공</Badge>;
        }
        return <Badge variant="destructive">사건 해결 실패</Badge>;
    };

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-white mb-2">탐정 대시보드</h1>
                        <p className="text-purple-200">{user.nickname}님, 환영합니다 (점수: {user.score})</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={onShowRanking}
                            variant="outline"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                            <Trophy className="size-4 mr-2" />
                            랭킹
                        </Button>
                        <Button
                            onClick={onLogout}
                            variant="outline"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                            <LogOut className="size-4 mr-2" />
                            로그아웃
                        </Button>
                    </div>
                </div>

                {/* Info Banner */}
                <Card className="p-6 mb-8 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <div className="flex items-center gap-4">
                        <Search className="size-8 flex-shrink-0" />
                        <div>
                            <h3 className="mb-1">탐정 역할 안내</h3>
                            <p className="text-purple-100 text-sm">
                                배정된 사건의 증거를 분석하고 진짜 범인을 찾아내세요. 진실은 언제나 하나!
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Active Cases */}
                <div className="mb-8">
                    <h2 className="text-white mb-4">진행 중인 사건 (STATUS: 배정)</h2>
                    {loading && <Card className="p-12 text-center text-purple-500 flex items-center justify-center gap-2"><Loader2 className="animate-spin size-5" /> 사건 목록 로딩 중...</Card>}
                    
                    {!loading && assignedCases.filter(c => c.status === '배정').length === 0 ? (
                        <Card className="p-12 text-center">
                            <p className="text-muted-foreground">진행 중인 사건이 없습니다</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {assignedCases
                                .filter(c => c.status === '배정')
                                .map((caseItem) => (
                                    <Card key={caseItem.activeId} className="p-6 hover:shadow-lg transition-shadow border-2 border-purple-500">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3>{caseItem.caseTitle}</h3>
                                                    <span className="text-yellow-500">{getDifficultyStars(caseItem.difficulty)}</span>
                                                    <Badge className="bg-purple-500 hover:bg-purple-600">
                                                        {caseItem.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-muted-foreground text-sm mb-3">
                                                    {caseItem.caseDescription}
                                                </p>
                                                <div className="flex gap-4 text-sm text-muted-foreground">
                                                    <span>의뢰인: {caseItem.clientNickname}</span>
                                                    <span>배정 경찰: {caseItem.policeNickname}</span>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => handleInvestigate(caseItem)}
                                                className="bg-purple-500 hover:bg-purple-600"
                                            >
                                                <Search className="size-4 mr-2" />
                                                사건 조사
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                        </div>
                    )}
                </div>

                {/* Completed Cases */}
                <div>
                    <h2 className="text-white mb-4">완료된 사건 (STATUS: 결과 확인)</h2>
                    {!loading && assignedCases.filter(c => c.status === '결과 확인').length === 0 ? (
                        <Card className="p-12 text-center">
                            <p className="text-muted-foreground">완료된 사건이 없습니다</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {assignedCases
                                .filter(c => c.status === '결과 확인')
                                .map((caseItem) => (
                                    <Card key={caseItem.activeId} className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3>{caseItem.caseTitle}</h3>
                                                    <span className="text-yellow-500">{getDifficultyStars(caseItem.difficulty)}</span>
                                                    {getResultBadge(caseItem.result)}
                                                </div>
                                                <p className="text-muted-foreground text-sm mb-2">
                                                    추리 결과: {caseItem.culpritGuess}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => setViewResultCase(caseItem)}
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                        >
                                            <Eye className="size-4 mr-2" />
                                            결과 확인
                                        </Button>
                                    </Card>
                                ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedCase && (
                <InvestigationModal
                    caseData={{
                        activeId: selectedCase.activeId,
                        caseId: selectedCase.caseId, 
                        caseTitle: selectedCase.caseTitle,
                        caseDescription: selectedCase.caseDescription,
                        difficulty: selectedCase.difficulty,
                    }}
                    onClose={() => setSelectedCase(null)}
                    onComplete={handleInvestigationComplete}
                />
            )}

            {viewResultCase && (
                <CaseResultModal
                    caseData={{
                        activeId: viewResultCase.activeId,
                        caseTitle: viewResultCase.caseTitle,
                        caseDescription: viewResultCase.caseDescription,
                        culpritGuess: viewResultCase.culpritGuess,
                        actualCulprit: viewResultCase.actualCulprit,
                        result: viewResultCase.result,
                        // NOTE: viewResultCase.policeNickname은 아마도 detectiveNickname으로 쓰이는 듯 함
                        detectiveNickname: viewResultCase.policeNickname, 
                        difficulty: viewResultCase.difficulty,
                    }}
                    userRole="detective"
                    onClose={() => setViewResultCase(null)}
                />
            )}
        </div>
    );
}