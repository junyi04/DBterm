import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, CheckCircle, XCircle, Heart, Flower2, Send } from 'lucide-react';
import { toast } from 'sonner';

// 🚨 1. Props 인터페이스 필드 수정: detectiveNickname의 '?' 제거
interface CaseResultModalProps {
    caseData: {
        activeId: number;
        caseId: number;
        caseTitle: string; 
        caseDescription: string;
        culpritGuess: string | null;
        actualCulprit: string | null;
        result: string | null;
        detectiveNickname: string | null; // 🚨 수정 완료: Optional (?) 제거
        difficulty: number;
        // NOTE: activeId가 CaseResultModal의 DTO에 포함되어 있다면 여기에 추가해야 함
    };
    userRole: 'client' | 'detective';
    onClose: () => void;
}

export function CaseResultModal({ caseData, userRole, onClose }: CaseResultModalProps) {
    // 🚨 2. 변수 사용처 수정 (isSuccess, isSolved)
    const isSuccess = caseData.result === '감사';
    const isSolved = caseData.culpritGuess === caseData.actualCulprit;

    const handleSendMessage = () => {
        // TODO: Replace with your actual API endpoint for sending messages
        // toast 메시지로 변경하여 알림 기능 대체
        toast.info(isSuccess ? '✅ 감사 인사를 전송했습니다!' : '💐 국화꽃을 보냈습니다...');
    };

    const getDifficultyStars = (difficulty: number) => {
        return '⭐'.repeat(difficulty);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl">
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 rounded-t-lg">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-white">사건 결과</h2>
                                {/* caseData 필드명 사용처 수정 */}
                                <span className="text-yellow-500">{getDifficultyStars(caseData.difficulty)}</span>
                            </div>
                            {/* caseData 필드명 사용처 수정 */}
                            <h3 className="text-white mb-1">{caseData.caseTitle}</h3>
                        </div>
                        <Button onClick={onClose} variant="ghost" size="sm" className="text-white hover:bg-white/20">
                            <X className="size-4" />
                        </Button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Result Banner (isSuccess 변수 사용 유지) */}
                    <Card className={`p-6 ${isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center gap-4">
                            {isSuccess ? (
                                <>
                                    <CheckCircle className="size-12 text-green-500 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-green-900 mb-1">사건 해결 성공!</h3>
                                        <p className="text-sm text-green-700">
                                            탐정이 진짜 범인을 찾아냈습니다.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <XCircle className="size-12 text-red-500 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-red-900 mb-1">사건 미해결</h3>
                                        <p className="text-sm text-red-700">
                                            범인이 탐정을 속이는데 성공했습니다.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>

                    {/* Case Details */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="mb-2">사건 개요</h3>
                            {/* caseData 필드명 사용처 수정 */}
                            <p className="text-muted-foreground text-sm">{caseData.caseDescription}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Card className="p-4">
                                <div className="text-sm text-muted-foreground mb-1">탐정의 추리</div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={isSolved ? 'default' : 'destructive'}>
                                        {/* caseData 필드명 사용처 수정 */}
                                        {caseData.culpritGuess || '미제출'}
                                    </Badge>
                                </div>
                            </Card>

                            <Card className="p-4">
                                <div className="text-sm text-muted-foreground mb-1">실제 범인</div>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-slate-700 hover:bg-slate-800">
                                        {/* caseData 필드명 사용처 수정 */}
                                        {caseData.actualCulprit || '???'}
                                    </Badge>
                                </div>
                            </Card>
                        </div>

                        {/* caseData 필드명 사용처 수정 */}
                        {caseData.detectiveNickname && (
                            <Card className="p-4 bg-slate-50">
                                <div className="text-sm text-muted-foreground mb-1">담당 탐정</div>
                                {/* caseData 필드명 사용처 수정 */}
                                <div className="font-medium">{caseData.detectiveNickname}</div>
                            </Card>
                        )}
                    </div>

                    {/* Action Messages (userRole 기반으로 분기) */}
                    {userRole === 'client' && (
                        <Card className={`p-6 ${isSuccess ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-start gap-4">
                                {isSuccess ? (
                                    <>
                                        <Heart className="size-8 text-blue-500 flex-shrink-0" />
                                        <div className="flex-1">
                                            <h4 className="mb-2">의뢰인의 감사</h4>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                사건을 해결해주신 탐정님께 감사의 인사를 전합니다.
                                            </p>
                                            <Button onClick={handleSendMessage} className="bg-blue-500 hover:bg-blue-600">
                                                <Send className="size-4 mr-2" />
                                                감사 인사 보내기
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Flower2 className="size-8 text-gray-500 flex-shrink-0" />
                                        <div className="flex-1">
                                            <h4 className="mb-2">의뢰인의 부고</h4>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                사건이 해결되지 못해 범인에게 보복을 당했습니다...
                                            </p>
                                            <Badge variant="secondary">탐정에게 부고 소식이 전달되었습니다</Badge>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>
                    )}

                    {userRole === 'detective' && (
                        <Card className={`p-6 ${isSuccess ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-start gap-4">
                                {isSuccess ? (
                                    <>
                                        <Heart className="size-8 text-purple-500 flex-shrink-0" />
                                        <div className="flex-1">
                                            <h4 className="mb-2">사건 해결 보상</h4>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                성공적인 추리로 포인트를 획득했습니다. 의뢰인에게 격려 메시지를 보낼 수 있습니다.
                                            </p>
                                            <Button onClick={handleSendMessage} className="bg-purple-500 hover:bg-purple-600">
                                                <Send className="size-4 mr-2" />
                                                격려 메시지 보내기
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Flower2 className="size-8 text-gray-500 flex-shrink-0" />
                                        <div className="flex-1">
                                            <h4 className="mb-2">의뢰인의 부고</h4>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                사건을 해결하지 못해 의뢰인이 범인에게 보복을 당했습니다...
                                            </p>
                                            <Button onClick={handleSendMessage} variant="secondary">
                                                <Flower2 className="size-4 mr-2" />
                                                국화꽃 보내기
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>
                    )}
                </div>

                <div className="border-t p-6 flex justify-end">
                    <Button onClick={onClose}>닫기</Button>
                </div>
            </Card>
        </div>
    );
}