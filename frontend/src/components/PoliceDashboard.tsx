import { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LogOut, Shield, Trophy, Loader2 } from 'lucide-react';
import type { User } from '../App';
import { DetectiveAssignModal } from './DetectiveAssignModal';
import axios from 'axios';
import { toast } from 'sonner';

const apiClient = axios.create({ baseURL: '/api', withCredentials: true });

interface PoliceDashboardProps {
    user: User;
    onLogout: () => void;
    onShowRanking: () => void;
}

// 🚨 백엔드 DTO에 맞게 Camel Case 및 구조 수정
interface PendingCase {
    activeId: number; 
    caseId: number; 
    caseTitle: string;
    caseDescription: string;
    clientNickname: string;
    culpritNickname: string;
    status: string; // '조작' 또는 '접수중'
    difficulty: number;
    policeId: number | null; // 이미 접수한 경우 대비
    detectiveId: number | null; // 이미 배정한 경우 대비
}


export function PoliceDashboard({ user, onLogout, onShowRanking }: PoliceDashboardProps) {
    const [pendingCases, setPendingCases] = useState<PendingCase[]>([]);
    const [selectedCase, setSelectedCase] = useState<PendingCase | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 🚨 1. 접수 대기 중인 사건 목록 조회 API 연동
    const fetchPendingCases = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // GET /api/cases/police/pending 호출 (STATUS='조작' 또는 '접수중' 상태의 사건 목록)
            const response = await apiClient.get<PendingCase[]>(`/cases/police/pending`);
            setPendingCases(response.data);
        } catch (err: any) {
            setError("접수 대기 중인 사건 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingCases();
    }, [fetchPendingCases]);

    // 🚨 2. 사건 접수 요청 API 연동 (상태를 '접수 중'으로 변경 및 경찰 ID 등록)
    const handleAcceptCase = async (caseItem: PendingCase) => {
        try {
            // POST /api/cases/police/accept 호출 (백엔드에서 경찰 ID 등록 및 상태 변경 처리)
            await apiClient.post('/cases/police/accept', {
                activeId: caseItem.activeId,
                policeId: user.id,
            });

            toast.success(`'${caseItem.caseTitle}' 사건을 접수했습니다. 이제 탐정을 배정하세요.`);
            fetchPendingCases(); // 목록 갱신
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || "사건 접수 중 서버 오류가 발생했습니다.";
            toast.error(errorMessage);
        }
    };

    const handleDetectiveAssigned = () => {
        setSelectedCase(null);
        fetchPendingCases(); // 배정 완료 후 목록 갱신
    };

    const getDifficultyStars = (difficulty: number) => {
        return '⭐'.repeat(difficulty);
    };

    // DetectiveAssignModal에 전달할 CaseData 형식으로 변환
    const convertToCaseData = (caseItem: PendingCase) => ({
        activeId: caseItem.activeId,
        caseId: caseItem.caseId,
        caseTitle: caseItem.caseTitle,
        caseDescription: caseItem.caseDescription,
        difficulty: caseItem.difficulty,
    });

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-white mb-2">경찰 대시보드</h1>
                        <p className="text-green-200">{user.nickname}님, 환영합니다 (점수: {user.score})</p>
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
                <Card className="p-6 mb-8 bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <div className="flex items-center gap-4">
                        <Shield className="size-8 flex-shrink-0" />
                        <div>
                            <h3 className="mb-1">경찰 역할 안내</h3>
                            <p className="text-green-100 text-sm">
                                의뢰된 사건을 접수하고 적절한 탐정을 배정하여 사건 해결을 돕습니다
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Cases List */}
                <div>
                    <h2 className="text-white mb-4">사건 목록 (STATUS: 조작/접수중)</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {loading ? (
                            <Card className="p-12 text-center text-green-500 flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin size-5" /> 사건 목록을 불러오는 중...
                            </Card>
                        ) : error ? (
                            <Card className="p-4 text-center text-red-500">{error}</Card>
                        ) : pendingCases.length === 0 ? (
                            <Card className="p-12 text-center">
                                <p className="text-muted-foreground">현재 접수 가능한 사건이 없습니다</p>
                            </Card>
                        ) : (
                            pendingCases.map((caseItem) => (
                                <Card key={caseItem.activeId} className="p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3>{caseItem.caseTitle}</h3>
                                                <span className="text-yellow-500">{getDifficultyStars(caseItem.difficulty)}</span>
                                                <Badge variant={caseItem.status === '조작' ? 'outline' : 'secondary'}>
                                                    {caseItem.status}
                                                </Badge>
                                            </div>
                                            <p className="text-muted-foreground text-sm mb-3">
                                                {caseItem.caseDescription}
                                            </p>
                                            <div className="flex gap-4 text-sm text-muted-foreground">
                                                <span>의뢰인: {caseItem.clientNickname}</span>
                                                <span>범인 지정됨: {caseItem.culpritNickname}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {caseItem.status === '조작' ? ( // '조작' 완료 상태일 때 접수 가능
                                                <Button
                                                    onClick={() => handleAcceptCase(caseItem)}
                                                    className="bg-green-500 hover:bg-green-600"
                                                >
                                                    <Shield className="size-4 mr-2" />
                                                    접수하기
                                                </Button>
                                            ) : ( // '접수중' 상태일 때 탐정 배정 가능
                                                <Button
                                                    onClick={() => setSelectedCase(caseItem)}
                                                    variant="outline"
                                                    disabled={caseItem.status !== '접수중'}
                                                >
                                                    탐정 배정
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {selectedCase && (
                <DetectiveAssignModal
                    caseData={convertToCaseData(selectedCase)}
                    policeId={user.id} // 🚨 경찰 ID 전달
                    onClose={() => setSelectedCase(null)}
                    onDetectiveAssigned={fetchPendingCases} // 배정 완료 후 목록 갱신
                />
            )}
        </div>
    );
}