import { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card'; // 🚨 경로 수정
import { Button } from './ui/button'; // 🚨 경로 수정
import { Badge } from './ui/badge'; // 🚨 경로 수정
import { LogOut, UserX, Trophy, AlertTriangle, Loader2, Save } from 'lucide-react';
import type { User } from '../App';
import { FakeEvidenceModal } from './FakeEvidenceModal'; // 🚨 경로 수정
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
    // NOTE: 백엔드의 getCasesByCulpritId 구현이 필요합니다.
    const fetchMyCases = useCallback(async () => {
        setLoadingMy(true);
        try {
            // GET /api/cases/culprit/{userId} 호출
            // 이 API는 CaseParticipation과 CaseInfo를 조인하여 MyCase DTO를 반환해야 합니다.
            const response = await apiClient.get<MyCase[]>(`/cases/culprit/${user.id}`);
            setMyCases(response.data);
        } catch (err: any) {
            // NOTE: 백엔드 구현이 완료되지 않았다면 404/500 오류가 발생할 수 있습니다.
            // setError("참여 중인 사건 목록을 불러오지 못했습니다."); 
            // DB 초기화 후 9번 API(getCasesByCulpritId)의 TODO 로직이 구현될 때까지 이 에러는 무시될 수 있습니다.
            console.error("참여 사건 로딩 실패:", err);
            setMyCases([]); // 실패 시 빈 배열로 설정
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
        // ❗ join은 하지 않는다 — 조작 완료 시에만 DB에 반영됨
        setSelectedCase(caseItem);
    };

    // 증거 조작 모달을 닫고 목록을 갱신 (참여 목록만 갱신)
    const handleEvidenceSelected = () => {
        setSelectedCase(null);
        fetchAvailableCases();

        fetchMyCases(); // 🚨 조작 완료 후 '내가 참여한 사건' 목록 갱신
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
                                <Card key={caseItem.caseId} className="p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                {/* 🚨 [수정 1] 제목을 가장 위에 표시 */}
                                                <h3 className="text-xl font-semibold">{caseItem.caseTitle}</h3> 
                                                <span className="text-yellow-500">{getDifficultyStars(caseItem.difficulty)}</span>
                                            </div>
                                            <p className="text-muted-foreground text-sm mb-3">
                                                {caseItem.caseDescription}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                의뢰인: {caseItem.clientNickname || '미정'}
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
                                <Card key={`my-${caseItem.activeId}`} className="p-6">
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
                                            
                                            {/* 🚨 [수정 2] 증거 조작 완료/필요 상태 메시지 및 버튼 */}
                                            {/* Case 1: 참여만 했고 아직 조작이 필요한 상태 (status='등록') */}
                                            {!caseItem.fakeEvidenceSelected && caseItem.status === '등록' && (
                                                <>
                                                    <Badge variant="destructive">증거 조작 필요</Badge>
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
                                                        <Save className="size-4 mr-1"/> 증거 조작하기
                                                    </Button>
                                                </>
                                            )}
                                            
                                            {/* Case 2: 조작을 완료하고 경찰 배정 대기 중인 상태 (status='조작') */}
                                            {caseItem.status === '조작' && (
                                                <Badge variant="secondary" className="bg-green-500 hover:bg-green-600 text-white">
                                                    경찰 배정 대기 중 (조작 완료)
                                                </Badge>
                                            )}

                                            {/* Case 3: 경찰이 탐정을 배정한 상태 (status='배정') */}
                                            {caseItem.status === '배정' && (
                                                <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                                                    탐정 조사 중
                                                </Badge>
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
                <FakeEvidenceModal
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