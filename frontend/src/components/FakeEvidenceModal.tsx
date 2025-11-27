import { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card'; // 🚨 경로 수정
import { Button } from './ui/button'; // 🚨 경로 수정
import { X, Loader2, Save } from 'lucide-react'; 
import axios from 'axios';
import { toast } from 'sonner';

const apiClient = axios.create({ baseURL: '/api', withCredentials: true });

// 🚨 백엔드 OriginalEvidence 도메인에 대응하는 인터페이스
interface Evidence {
    id: number;
    caseId: number;
    description: string;
    isFakeCandidate: boolean; // 거짓 증거 후보 여부
}

interface ActiveCase {
    activeId: number;
    caseId: number;
    caseTitle: string;
    caseDescription: string;
    difficulty: number;
}

interface FakeEvidenceModalProps {
    activeCase: ActiveCase;
    userId: number; // 범인 ID
    onClose: () => void;
    onEvidenceSelected: () => void;
}

export function FakeEvidenceModal({ activeCase, userId, onClose, onEvidenceSelected }: FakeEvidenceModalProps) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [evidences, setEvidences] = useState<Evidence[]>([]);
    const [selectedFakeEvidence, setSelectedFakeEvidence] = useState<Evidence | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    // 🚨 [추가] API에서 받은 사건 제목/내용을 저장할 상태
    const [caseData, setCaseData] = useState({ title: activeCase.caseTitle, description: activeCase.caseDescription });

    // 🚨 1. 증거 목록 및 사건 상세 정보 로딩
    const fetchEvidenceDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // GET /api/cases/culprit/fabricate/details/{caseId} 호출
            const response = await apiClient.get<{ 
                caseTitle: string;
                caseDescription: string;
                originalEvidences: Evidence[];
            }>(`/cases/culprit/fabricate/details/${activeCase.caseId}`);

            // 🚨 [수정 1] API 응답에서 받은 정확한 제목/내용으로 Header 업데이트
            setCaseData({
                title: response.data.caseTitle,
                description: response.data.caseDescription,
            });

            // 백엔드에서 받은 증거 목록 저장
            setEvidences(response.data.originalEvidences);
            
            // 🚨 [수정 2] 초기 자동 선택 로직 제거! 사용자가 직접 선택하도록 유도.
            setSelectedFakeEvidence(null); 

            const fakeCandidates = response.data.originalEvidences.filter(e => e.isFakeCandidate);
            if (fakeCandidates.length === 0) {
                setError("거짓 증거 후보를 찾을 수 없습니다.");
            }

        } catch (err: any) {
            setError("사건 상세 및 증거 목록을 불러오지 못했습니다.");
            toast.error("증거 목록 로드 실패!");
        } finally {
            setLoading(false);
        }
    }, [activeCase.caseId]);

    useEffect(() => {
        fetchEvidenceDetails();
    }, [fetchEvidenceDetails]);

    // 🚨 2. 증거 조작 완료 처리 및 상태 변경 요청
    const handleSubmitFabrication = async () => {
        if (!selectedFakeEvidence) {
            toast.error("거짓 증거를 선택해주세요.");
            return;
        }

        setSubmitting(true);
        try {
            // POST /api/cases/fabricate 호출 (백엔드 2번 로직)
            await apiClient.post('/cases/fabricate', {
                caseId: activeCase.caseId,
                criminalId: userId,
                // 백엔드가 description을 찾도록 설계되어 있으므로 그대로 전달
                fakeEvidence: selectedFakeEvidence.description 
            });

            toast.success(`'${caseData.title}' 사건의 증거 조작이 완료되었습니다. 사건이 경찰에 배정 대기 중입니다.`);
            onEvidenceSelected(); // 대시보드 갱신
            onClose();

        } catch (err: any) {
            const errorMessage = err.response?.data?.error || "증거 조작 중 오류가 발생했습니다.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const trueEvidences = evidences.filter(e => !e.isFakeCandidate);
    const fakeEvidences = evidences.filter(e => e.isFakeCandidate);
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
                    <div>
                        {/* 🚨 [수정 3] API에서 받은 caseData를 사용 */}
                        <h2 className="mb-1 text-red-600">🚨 증거 조작실: {caseData.title}</h2>
                        <p className="text-sm text-muted-foreground">{caseData.description}</p>
                    </div>
                    <Button onClick={onClose} variant="ghost" size="sm" disabled={submitting}>
                        <X className="size-4" />
                    </Button>
                </div>

                <div className="p-6 space-y-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-40 text-red-500">
                            <Loader2 className="animate-spin size-6 mr-2" /> 증거 목록 로딩 중...
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 p-4 border border-red-300 rounded">{error}</div>
                    ) : (
                        <div className="grid grid-cols-2 gap-6">
                            {/* 진짜 증거 목록 */}
                            <div>
                                <h3 className="text-lg font-semibold text-green-700 mb-3">✅ 원래 증거 (3개)</h3>
                                <div className="space-y-2">
                                    {trueEvidences.map((e) => (
                                        <Card key={e.id} className="p-3 bg-green-50 border-green-200">
                                            <p className="text-sm text-green-800">{e.description}</p>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                            
                            {/* 거짓 증거 후보 선택 */}
                            <div>
                                <h3 className="text-lg font-semibold text-red-700 mb-3">🔥 거짓 증거 후보 선택 (1개만 선택)</h3>
                                <p className="text-sm text-muted-foreground mb-4">이 중 하나를 선택하여 진짜 증거 3개와 섞어 탐정에게 제출합니다.</p>
                                <div className="space-y-2">
                                    {fakeEvidences.map((e) => (
                                        <Card 
                                            key={e.id} 
                                            className={`p-3 cursor-pointer transition-all ${
                                                selectedFakeEvidence?.id === e.id 
                                                    ? 'ring-2 ring-red-500 bg-red-100' 
                                                    : 'hover:bg-gray-50'
                                            }`}
                                            onClick={() => setSelectedFakeEvidence(e)}
                                        >
                                            <p className="text-sm font-medium text-red-800">{e.description}</p>
                                        </Card>
                                    ))}
                                </div>
                                {!selectedFakeEvidence && <p className="text-red-500 mt-2">거짓 증거를 반드시 선택해야 합니다.</p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer (저장 버튼) */}
                <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-3">
                    <Button onClick={onClose} variant="outline" disabled={submitting}>
                        취소
                    </Button>
                    <Button 
                        onClick={handleSubmitFabrication} 
                        disabled={!selectedFakeEvidence || submitting || loading}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        {submitting ? (
                            <><Loader2 className="size-4 mr-2 animate-spin" /> 증거 조작 및 사건 제출 중</>
                        ) : (
                            <><Save className="size-4 mr-2" /> 조작 완료 및 경찰에 제출</>
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
}