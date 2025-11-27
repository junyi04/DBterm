import { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LogOut, UserX, Trophy, AlertTriangle, Loader2 } from 'lucide-react';
import type { User } from '../App';
import { FakeEvidenceModal } from './FakeEvidenceModal';
import axios from 'axios';
import { toast } from 'sonner';

const apiClient = axios.create({ baseURL: '/api', withCredentials: true });

interface CulpritDashboardProps {
    user: User;
    onLogout: () => void;
    onShowRanking: () => void;
}

// 🚨 백엔드 DTO에 맞게 Camel Case 및 구조 수정
interface CaseDetails {
    caseId: number;
    activeId: number;
    caseTitle: string;
    caseDescription: string;
    clientNickname: string;
    difficulty: number;
}

interface AvailableCase extends CaseDetails {}

interface MyCase extends CaseDetails {
    status: string;
    fakeEvidenceSelected: boolean; // fake_evidence_selected -> fakeEvidenceSelected
}


export function CulpritDashboard({ user, onLogout, onShowRanking }: CulpritDashboardProps) {
    const [availableCases, setAvailableCases] = useState<AvailableCase[]>([]);
    const [myCases, setMyCases] = useState<MyCase[]>([]);
    const [loadingAvailable, setLoadingAvailable] = useState(true);
    const [loadingMy, setLoadingMy] = useState(true);
    const [selectedCase, setSelectedCase] = useState<CaseDetails | null>(null); // CaseDetails 사용
    const [error, setError] = useState<string | null>(null);

    // 🚨 1. 참여 가능한 사건 목록 조회 (STATUS='등록', CRIMINAL_ID is NULL)
    const fetchAvailableCases = useCallback(async () => {
        setLoadingAvailable(true);
        try {
            // GET /api/cases/culprit/available 호출
            const response = await apiClient.get<AvailableCase[]>('/cases/culprit/available');
            setAvailableCases(response.data);
        } catch (err: any) {
            setError("참여 가능한 사건 목록을 불러오지 못했습니다.");
        } finally {
            setLoadingAvailable(false);
        }
    }, []);

    // 🚨 2. 내가 참여한 사건 목록 조회 (CRIMINAL_ID = userId)
    const fetchMyCases = useCallback(async () => {
        setLoadingMy(true);
        try {
            // GET /api/cases/culprit/{userId} 호출
            const response = await apiClient.get<MyCase[]>(`/cases/culprit/${user.id}`);
            setMyCases(response.data);
        } catch (err: any) {
            setError("참여 중인 사건 목록을 불러오지 못했습니다.");
        } finally {
            setLoadingMy(false);
        }
    }, [user.id]);


    useEffect(() => {
        fetchAvailableCases();
        fetchMyCases();
    }, [fetchAvailableCases, fetchMyCases]);

    // 🚨 3. 범인으로 사건에 참여 요청
    const handleJoinCase = async (caseItem: AvailableCase) => {
        try {
            // POST /api/cases/culprit/join 호출 (백엔드에서 CRIMINAL_ID 등록 및 점수 +1 처리)
            await apiClient.post('/cases/culprit/join', {
                caseId: caseItem.caseId,
                activeId: caseItem.activeId,
                culpritId: user.id, // 현재 로그인된 범인의 ID
            });

            toast.success(`'${caseItem.caseTitle}' 사건에 범인으로 참여했습니다!`);
            fetchAvailableCases(); // 목록 갱신
            fetchMyCases();
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || "참여 요청 중 서버 오류가 발생했습니다.";
            toast.error(errorMessage);
        }
    };

    // 증거 조작 모달을 닫고 목록을 갱신
    const handleEvidenceSelected = () => {
        setSelectedCase(null);
        fetchMyCases(); 
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
                        <h1 className="text-white mb-2">범인 대시보드</h1>
                        <p className="text-red-200">{user.nickname}님, 환영합니다 (점수: {user.score})</p>
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

                {/* Warning Banner */}
                <Card className="p-6 mb-8 bg-gradient-to-r from-red-500 to-red-600 text-white">
                    <div className="flex items-center gap-4">
                        <AlertTriangle className="size-8 flex-shrink-0" />
                        <div>
                            <h3 className="mb-1">범인 역할 안내</h3>
                            <p className="text-red-100 text-sm">
                                사건을 선택하고 거짓 증거를 조작하여 탐정을 혼란시키세요. 들키지 않으면 승리합니다!
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Available Cases */}
                <div className="mb-8">
                    <h2 className="text-white mb-4">참여 가능한 사건</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {loadingAvailable ? (
                            <Card className="p-12 text-center text-red-500 flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin size-5" /> 사건 목록 로딩 중...
                            </Card>
                        ) : availableCases.length === 0 ? (
                            <Card className="p-12 text-center">
                                <p className="text-muted-foreground">현재 참여 가능한 사건이 없습니다</p>
                            </Card>
                        ) : (
                            availableCases.map((caseItem) => (
                                <Card key={caseItem.activeId} className="p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3>{caseItem.caseTitle}</h3>
                                                <span className="text-yellow-500">{getDifficultyStars(caseItem.difficulty)}</span>
                                            </div>
                                            <p className="text-muted-foreground text-sm mb-3">
                                                {caseItem.caseDescription}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                의뢰인: {caseItem.clientNickname}
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => handleJoinCase(caseItem)}
                                            className="bg-red-500 hover:bg-red-600"
                                        >
                                            <UserX className="size-4 mr-2" />
                                            범인으로 참여
                                        </Button>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* My Cases */}
                <div>
                    <h2 className="text-white mb-4">내가 참여한 사건</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {loadingMy ? (
                            <Card className="p-12 text-center text-red-500 flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin size-5" /> 참여 사건 목록 로딩 중...
                            </Card>
                        ) : myCases.length === 0 ? (
                            <Card className="p-12 text-center">
                                <p className="text-muted-foreground">참여한 사건이 없습니다</p>
                            </Card>
                        ) : (
                            myCases.map((caseItem) => (
                                <Card key={caseItem.activeId} className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3>{caseItem.caseTitle}</h3>
                                                <span className="text-yellow-500">{getDifficultyStars(caseItem.difficulty)}</span>
                                            </div>
                                            <p className="text-muted-foreground text-sm mb-3">
                                                {caseItem.caseDescription}
                                            </p>
                                            
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Badge>{caseItem.status}</Badge>
                                            {caseItem.fakeEvidenceSelected ? (
                                                <Badge variant="secondary" className="bg-green-500 hover:bg-green-600 text-white">
                                                    증거 조작 완료
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive">증거 조작 필요</Badge>
                                            )}
                                        </div>
                                    </div>
                                    {!caseItem.fakeEvidenceSelected && caseItem.status === '조작' && ( // STATUS가 '조작' 상태일 때만 조작 가능하도록 추가 조건
                                        <Button
                                            onClick={() => setSelectedCase({
                                                activeId: caseItem.activeId,
                                                caseId: caseItem.caseId,
                                                caseTitle: caseItem.caseTitle,
                                                caseDescription: caseItem.caseDescription,
                                                clientNickname: caseItem.clientNickname,
                                                difficulty: caseItem.difficulty,
                                            })}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            증거 조작하기
                                        </Button>
                                    )}
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {selectedCase && (
                <FakeEvidenceModal
                    // activeCase의 속성명을 Camel Case로 통일 및 필요한 caseId 전달
                    activeCase={{
                        activeId: selectedCase.activeId,
                        caseId: selectedCase.caseId,
                        caseTitle: selectedCase.caseTitle,
                        caseDescription: selectedCase.caseDescription,
                        difficulty: selectedCase.difficulty,
                    }}
                    // userId를 FakeEvidenceModal로 넘겨서 범인 ID를 알 수 있도록 수정
                    userId={user.id} 
                    onClose={() => setSelectedCase(null)}
                    onEvidenceSelected={handleEvidenceSelected}
                />
            )}
        </div>
    );
}