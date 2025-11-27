import { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LogOut, FileText, Trophy, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import type { User } from '../App';
import { CaseSelectionModal } from './CaseSelectionModal';
import { CaseResultModal } from './CaseResultModal';
import axios from 'axios'; // 🚨 axios import 추가
import { toast } from 'sonner'; // 🚨 toast import 추가

const apiClient = axios.create({ baseURL: '/api', withCredentials: true });

interface ClientDashboardProps {
    user: User;
    onLogout: () => void;
    onShowRanking: () => void;
}

// 🚨 ActiveCase 인터페이스 수정 (DTO에 맞춰 카멜 케이스로 통일)
interface ActiveCase {
    caseId: number; // case_id는 없지만 CaseClientDto에는 caseId가 있으므로 추가
    activeId: number; // active_id -> activeId
    caseTitle: string; // case_title -> caseTitle
    caseDescription: string; // case_description -> caseDescription
    status: string;
    result: '감사' | '부고' | null; // 결과 타입 명시
    detectiveNickname: string | null; // detective_nickname -> detectiveNickname
    culpritGuess: string | null; // culprit_guess -> culpritGuess
    actualCulprit: string | null; // actual_culprit -> actualCulprit
    difficulty: number;
}


export function ClientDashboard({ user, onLogout, onShowRanking }: ClientDashboardProps) {
    const [myCases, setMyCases] = useState<ActiveCase[]>([]);
    const [showCaseSelection, setShowCaseSelection] = useState(false);
    const [selectedCaseResult, setSelectedCaseResult] = useState<ActiveCase | null>(null);
    const [loading, setLoading] = useState(true); // 🚨 로딩 상태 추가
    const [error, setError] = useState<string | null>(null); // 🚨 에러 상태 추가

    // 🚨 1. API 호출 함수로 변경 및 useCallback 적용
    const fetchMyCases = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // GET /api/cases/client/{userId} API 호출
            const response = await apiClient.get<ActiveCase[]>(`/cases/client/${user.id}`);
            setMyCases(response.data);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || "의뢰 사건 목록을 불러오지 못했습니다.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => {
        fetchMyCases();
    }, [fetchMyCases]);

    const handleCaseRequest = () => {
        setShowCaseSelection(true);
    };

    const handleCaseSelected = () => {
        setShowCaseSelection(false);
        fetchMyCases(); // 새 사건 의뢰 후 목록 갱신
    };

    const getStatusBadge = (status: string) => {
        // 백엔드 STATUS: '등록', '조작', '배정', '추리 완료', '결과 확인'
        const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: any, label: string }> = {
            '등록': { variant: 'outline', icon: Clock, label: '대기중' },
            '조작': { variant: 'secondary', icon: FileText, label: '범인 조작 중' },
            '배정': { variant: 'default', icon: FileText, label: '탐정 배정 중' },
            '추리 완료': { variant: 'default', icon: CheckCircle, label: '추리 완료' },
            '결과 확인': { variant: 'default', icon: CheckCircle, label: '결과 확인' },
        };
        const config = variants[status] || variants['등록'];
        const Icon = config.icon;
        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="size-3" />
                {config.label}
            </Badge>
        );
    };

    const getResultBadge = (result: string | null) => {
        if (!result) return null;
        if (result === '감사') {
            return (
                <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
                    <CheckCircle className="size-3" />
                    사건 해결
                </Badge>
            );
        }
        if (result === '부고') {
            return (
                <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="size-3" />
                    미해결 (부고)
                </Badge>
            );
        }
        return null;
    };

    const getDifficultyStars = (difficulty: number) => {
        return '⭐'.repeat(difficulty);
    };

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-white mb-2">의뢰인 대시보드</h1>
                        <p className="text-blue-200">{user.nickname}님, 환영합니다 (점수: {user.score})</p>
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

                {/* Request New Case Button */}
                <Card className="p-6 mb-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="mb-2">새 사건 의뢰하기</h3>
                            <p className="text-blue-100 text-sm">사건을 선택하여 의뢰를 시작하세요</p>
                        </div>
                        <Button
                            onClick={handleCaseRequest}
                            size="lg"
                            className="bg-white text-blue-600 hover:bg-blue-50"
                        >
                            <FileText className="size-4 mr-2" />
                            사건 선택
                        </Button>
                    </div>
                </Card>

                {/* My Cases */}
                <div>
                    <h2 className="text-white mb-4">내 의뢰 사건</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {loading ? (
                            <Card className="p-12 text-center text-blue-500 flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin size-5" /> 사건 목록을 불러오는 중...
                            </Card>
                        ) : error ? (
                            <Card className="p-4 text-center text-red-500">{error}</Card>
                        ) : myCases.length === 0 ? (
                            <Card className="p-12 text-center">
                                <p className="text-muted-foreground">아직 의뢰한 사건이 없습니다</p>
                            </Card>
                        ) : (
                            myCases.map((caseItem) => (
                                // 🚨 active_id -> activeId 로 변경
                                <Card key={caseItem.activeId} className="p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                {/* 🚨 case_title -> caseTitle 로 변경 */}
                                                <h3>{caseItem.caseTitle}</h3> 
                                                <span className="text-yellow-500">{getDifficultyStars(caseItem.difficulty)}</span>
                                            </div>
                                            <p className="text-muted-foreground text-sm mb-3">
                                                {/* 🚨 case_description -> caseDescription 로 변경 */}
                                                {caseItem.caseDescription}
                                            </p>
                                            {/* 🚨 detective_nickname -> detectiveNickname 로 변경 */}
                                            {caseItem.detectiveNickname && (
                                                <p className="text-sm text-muted-foreground">
                                                    담당 탐정: {caseItem.detectiveNickname}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {getStatusBadge(caseItem.status)}
                                            {/* 결과가 '결과 확인' 상태일 때만 결과 뱃지 표시 */}
                                            {caseItem.status === '결과 확인' && getResultBadge(caseItem.result)}
                                        </div>
                                    </div>
                                    {/* 🚨 caseItem.status === '결과 확인' 일 때만 결과 확인 가능 */}
                                    {caseItem.status === '결과 확인' && (
                                        <Button
                                            onClick={() => setSelectedCaseResult(caseItem)}
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                        >
                                            결과 확인
                                        </Button>
                                    )}
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {showCaseSelection && (
                <CaseSelectionModal
                    userId={user.id}
                    onClose={() => setShowCaseSelection(false)}
                    onCaseSelected={handleCaseSelected}
                />
            )}

            {selectedCaseResult && (
                <CaseResultModal
                    caseData={{
                        activeId: selectedCaseResult.activeId,
                        caseId: selectedCaseResult.caseId,
                        caseTitle: selectedCaseResult.caseTitle,
                        caseDescription: selectedCaseResult.caseDescription,
                        culpritGuess: selectedCaseResult.culpritGuess,
                        actualCulprit: selectedCaseResult.actualCulprit,
                        result: selectedCaseResult.result,
                        detectiveNickname: selectedCaseResult.detectiveNickname,
                        difficulty: selectedCaseResult.difficulty,
                    }}
                    userRole="client"
                    onClose={() => setSelectedCaseResult(null)}
                />
            )}
        </div>
    );
}