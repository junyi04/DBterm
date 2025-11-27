import { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input'; // Input은 사용되지 않으나 일단 유지
import { X, Search, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// 🚨 1. Props 인터페이스 필드를 카멜 케이스로 통일하고 caseId를 추가
interface InvestigationModalProps {
    caseData: {
        activeId: number; // active_id -> activeId
        caseId: number; // DetectiveDashboard에서 전달한 caseId 추가
        caseTitle: string; // case_title -> caseTitle
        caseDescription: string; // case_description -> caseDescription
        difficulty: number;
    };
    onClose: () => void;
    onComplete: () => void;
}

// 🚨 2. 내부 인터페이스 필드를 카멜 케이스로 통일 (백엔드 DTO 가정)
interface Evidence {
    evidenceId: number; // evidence_id -> evidenceId
    description: string;
    isFake?: boolean; // is_fake -> isFake
}

interface Suspect {
    suspectName: string; // suspect_name -> suspectName
    description: string;
}

export function InvestigationModal({ caseData, onClose, onComplete }: InvestigationModalProps) {
    const [evidence, setEvidence] = useState<Evidence[]>([]);
    const [suspects, setSuspects] = useState<Suspect[]>([]);
    const [selectedSuspect, setSelectedSuspect] = useState('');
    const [reasoning, setReasoning] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // activeId를 의존성 배열에 추가 (active_id -> activeId)
    useEffect(() => {
        fetchCaseDetails();
    }, [caseData.activeId]); 

    // API 호출 함수도 카멜 케이스에 맞게 수정
    const fetchCaseDetails = async () => {
        // TODO: Replace with your actual API endpoint
        // const evidenceRes = await fetch(`YOUR_API_URL/active-cases/${caseData.activeId}/evidence`);
        // const suspectsRes = await fetch(`YOUR_API_URL/cases/${caseData.caseId}/suspects`);
        // setEvidence(await evidenceRes.json());
        // setSuspects(await suspectsRes.json());

        // Mock data - Evidence 필드 이름 변경
        const mockEvidence: Evidence[] = [
            { 
                evidenceId: 1, 
                description: '범행 현장에서 발견된 지문 - 용의자 A와 일치',
                isFake: false // is_fake -> isFake
            },
            { 
                evidenceId: 2, 
                description: 'CCTV 영상 - 범행 시각에 용의자 A가 현장 근처에 있었음',
                isFake: false
            },
            { 
                evidenceId: 3, 
                description: '범행 시각에 용의자 B가 현장에서 목격되었다는 목격자 진술',
                isFake: true 
            },
            { 
                evidenceId: 4, 
                description: '목격자 진술 - 용의자 A와 비슷한 체형의 사람을 봤다고 증언',
                isFake: false
            },
        ];

        // Mock data - Suspect 필드 이름 변경
        const mockSuspects: Suspect[] = [
            { suspectName: '용의자 A', description: '피해자의 동료, 최근 다툼이 있었음' },
            { suspectName: '용의자 B', description: '피해자의 친구, 금전 거래가 있었음' },
            { suspectName: '용의자 C', description: '피해자의 이웃, 소음 문제로 불편함을 표시' },
            { suspectName: '용의자 D', description: '피해자의 친척, 유산 상속 문제가 있었음' },
        ];

        setEvidence(mockEvidence);
        setSuspects(mockSuspects);
    };

    const handleSubmit = async () => {
        if (!selectedSuspect) return;
        setIsSubmitting(true);
        
        try {
            // TODO: Replace with your actual API endpoint
            // API 호출 필드명도 카멜 케이스 DTO에 맞게 조정 가정
            // await fetch(`YOUR_API_URL/active-cases/${caseData.activeId}/submit-guess`, {
            //     method: 'PATCH',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ 
            //         culpritGuess: selectedSuspect, // culprit_guess -> culpritGuess
            //         reasoning: reasoning,
            //         status: '추리 완료' // 상태 변경
            //     })
            // });
            
            // 실제 제출 로직 (mocking 대신 API 호출 필요)
            toast.success(`'${selectedSuspect}'를 범인으로 추리 제출했습니다.`);

            onComplete();

        } catch (error) {
            toast.error("추리 제출에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getDifficultyStars = (difficulty: number) => {
        return '⭐'.repeat(difficulty);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-6 z-10">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h2>사건 조사</h2>
                                {/* caseData 필드명 변경 */}
                                <span className="text-yellow-500">{getDifficultyStars(caseData.difficulty)}</span>
                            </div>
                            {/* caseData 필드명 변경 */}
                            <h3 className="mb-1">{caseData.caseTitle}</h3>
                            <p className="text-sm text-muted-foreground">{caseData.caseDescription}</p>
                        </div>
                        <Button onClick={onClose} variant="ghost" size="sm">
                            <X className="size-4" />
                        </Button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Warning */}
                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <AlertTriangle className="size-5 text-purple-600 flex-shrink-0" />
                        <p className="text-sm text-purple-800">
                            증거 중 하나는 범인이 조작한 거짓 증거입니다. 신중하게 분석하세요!
                        </p>
                    </div>

                    {/* Evidence Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <h3>증거 자료</h3>
                            <Badge variant="secondary">총 {evidence.length}개</Badge>
                        </div>
                        <div className="space-y-2">
                            {evidence.map((item) => (
                                // evidence_id -> evidenceId
                                <Card key={item.evidenceId} className="p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="size-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm flex-1">{item.description}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Suspects Section */}
                    <div>
                        <div className="mb-4">
                            <h3 className="mb-2">용의자 목록</h3>
                            <p className="text-sm text-muted-foreground">
                                증거를 바탕으로 범인을 선택하세요
                            </p>
                        </div>
                        <div className="space-y-2">
                            {suspects.map((suspect) => (
                                // suspect_name -> suspectName
                                <Card
                                    key={suspect.suspectName}
                                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                                        selectedSuspect === suspect.suspectName
                                            ? 'ring-2 ring-purple-500 bg-purple-50'
                                            : 'hover:bg-gray-50'
                                    }`}
                                    onClick={() => setSelectedSuspect(suspect.suspectName)}
                                >
                                    <div className="flex items-start gap-3">
                                        <Search className="size-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            {/* suspect_name -> suspectName */}
                                            <h4 className="mb-1">{suspect.suspectName}</h4>
                                            <p className="text-sm text-muted-foreground">{suspect.description}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Reasoning Section */}
                    {selectedSuspect && (
                        <div>
                            <h3 className="mb-2">추리 근거 (선택사항)</h3>
                            <textarea
                                value={reasoning}
                                onChange={(e) => setReasoning(e.target.value)}
                                placeholder="범인을 선택한 이유를 설명하세요..."
                                className="w-full min-h-[100px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-3 z-10">
                    <Button onClick={onClose} variant="outline" disabled={isSubmitting}>
                        나중에
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={!selectedSuspect || isSubmitting}
                        className="bg-purple-500 hover:bg-purple-600"
                    >
                        {isSubmitting ? (
                            <>
                                <Search className="size-4 mr-2 animate-spin" />
                                제출 중...
                            </>
                        ) : (
                            <>
                                <Search className="size-4 mr-2" />
                                추리 제출
                            </>
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
}