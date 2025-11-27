import { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, Search, Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const apiClient = axios.create({ baseURL: '/api', withCredentials: true });

// 백엔드 OriginalEvidence 엔티티 구조와 일치
interface Evidence {
    evidenceId: number; 
    description: string;
    isTrue: boolean; 
    isFakeCandidate: boolean; 
}

interface CaseData {
    activeId: number;
    caseId: number;
    caseTitle: string;
    caseDescription: string;
    difficulty: number;
}

interface FakeEvidenceModalProps {
    activeCase: CaseData;
    userId: number; // 🚨 범인 ID를 받도록 수정
    onClose: () => void;
    onEvidenceSelected: () => void;
}


export function FakeEvidenceModal({ activeCase, userId, onClose, onEvidenceSelected }: FakeEvidenceModalProps) {
    const [evidenceOptions, setEvidenceOptions] = useState<Evidence[]>([]);
    const [selectedFake, setSelectedFake] = useState<Evidence | null>(null);
    const [showRealEvidence, setShowRealEvidence] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 🚨 1. 증거 옵션 조회 API 연동
    const fetchEvidence = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // GET /api/cases/evidence/original/{caseId} 호출 
            const response = await apiClient.get<Evidence[]>(`/cases/evidence/original/${activeCase.caseId}`);
            setEvidenceOptions(response.data);
        } catch (err: any) {
            setError("증거 목록을 불러오지 못했습니다.");
            toast.error("증거 목록 로드 실패!");
        } finally {
            setLoading(false);
        }
    }, [activeCase.caseId]);

    useEffect(() => {
        fetchEvidence();
    }, [fetchEvidence]);

    // 🚨 2. 증거 조작 완료 요청 API 연동
    const handleSubmit = async () => {
        if (!selectedFake || submitting) return;

        setSubmitting(true);
        setError(null);

        try {
            // POST /api/cases/fabricate 호출 (범인 조작 트랜잭션 시작)
            // activeId는 CASE_PARTICIPATION 레코드를 찾는 용도로 사용
            await apiClient.post('/cases/fabricate', {
                activeId: activeCase.activeId,
                caseId: activeCase.caseId,
                fakeEvidenceDescription: selectedFake.description,
                criminalId: userId, // 🚨 현재 로그인된 범인의 ID 전송
            });

            toast.success(`'${selectedFake.description}'으로 증거 조작이 완료되었습니다!`);
            onEvidenceSelected(); // 대시보드 갱신

        } catch (err: any) {
            const errorMessage = err.response?.data?.error || "증거 조작 중 서버 오류가 발생했습니다.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const getDifficultyStars = (difficulty: number) => {
        return '⭐'.repeat(difficulty);
    };
    
    // 진짜 증거만 필터링
    const realEvidence = evidenceOptions.filter(e => e.isTrue === true); 
    // 거짓 증거 후보만 필터링
    const fakeOptions = evidenceOptions.filter(e => e.isFakeCandidate === true);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-6 z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h2>{activeCase.caseTitle}</h2>
                                <span className="text-yellow-500">{getDifficultyStars(activeCase.difficulty)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{activeCase.caseDescription}</p>
                        </div>
                        <Button onClick={onClose} variant="ghost" size="sm" disabled={submitting}>
                            <X className="size-4" />
                        </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                        <AlertTriangle className="size-5 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-800">
                            진짜 증거를 확인하고, 거짓 증거를 선택하여 탐정을 혼란시키세요
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-48 text-red-500">
                        <Loader2 className="animate-spin size-6 mr-2" /> 증거 자료 로딩 중...
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 p-4 border border-red-300 m-6 rounded">{error}</div>
                ) : (
                    <div className="p-6 space-y-6">
                        {/* Real Evidence Section */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="flex items-center gap-2">
                                    진짜 증거
                                    <Badge variant="secondary">총 {realEvidence.length}개</Badge>
                                </h3>
                                <Button
                                    onClick={() => setShowRealEvidence(!showRealEvidence)}
                                    variant="outline"
                                    size="sm"
                                >
                                    {showRealEvidence ? (
                                        <><EyeOff className="size-4 mr-2" /> 숨기기</>
                                    ) : (
                                        <><Eye className="size-4 mr-2" /> 보기</>
                                    )}
                                </Button>
                            </div>
                            
                            {showRealEvidence && (
                                <div className="space-y-2">
                                    {realEvidence.map((evidence) => (
                                        <Card key={evidence.evidenceId} className="p-4 bg-green-50 border-green-200">
                                            <div className="flex items-start gap-3">
                                                <Badge className="bg-green-500 hover:bg-green-600 mt-1">진짜</Badge>
                                                <p className="flex-1 text-sm">{evidence.description}</p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Fake Evidence Selection */}
                        <div>
                            <div className="mb-4">
                                <h3 className="mb-2">거짓 증거 선택</h3>
                                <p className="text-sm text-muted-foreground">
                                    하나의 거짓 증거를 선택하여 증거 목록에 추가하세요
                                </p>
                            </div>
                            
                            <div className="space-y-3">
                                {fakeOptions.map((fake) => (
                                    <Card
                                        key={fake.evidenceId}
                                        className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                                            selectedFake?.evidenceId === fake.evidenceId
                                                ? 'ring-2 ring-red-500 bg-red-50'
                                                : 'hover:bg-gray-50'
                                        }`}
                                        onClick={() => setSelectedFake(fake)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Badge variant="destructive" className="mt-1">거짓</Badge>
                                            <p className="flex-1 text-sm">{fake.description}</p>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                            {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
                        </div>
                    </div>
                )}

                <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-3">
                    <Button onClick={onClose} variant="outline" disabled={submitting}>
                        취소
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={!selectedFake || submitting}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        {submitting ? (
                            <><Loader2 className="size-4 mr-2 animate-spin" /> 조작 중</>
                        ) : (
                            '증거 조작 완료'
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
}