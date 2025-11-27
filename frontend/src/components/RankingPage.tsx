import { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, Trophy, Medal, Award, TrendingUp, Search, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const apiClient = axios.create({ baseURL: '/api', withCredentials: true });

interface RankingPageProps {
    onBack: () => void;
}

// --- 타입 정의 시작 ---

// 1. 백엔드 DTO (API 응답 데이터 구조)
interface RankingDto {
    userId: number; 
    nickname: string;
    role: '의뢰인' | '범인' | '탐정';
    score: number;
    totalCases: number;
    successRate: number;
}

// 2. 프론트엔드에서 사용하는 랭킹 데이터 (DTO + rank)
interface RankedUser extends RankingDto {
    rank: number; // 프론트엔드에서 계산되어 추가되는 순위
}

// --- 타입 정의 끝 ---

// --- RankingTable 컴포넌트 (가독성을 위해 외부로 분리) ---

const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="size-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="size-6 text-gray-400" />;
    if (rank === 3) return <Award className="size-6 text-amber-700" />;
    return <span className="w-6 text-center font-bold">{rank}</span>;
};

const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 hover:bg-yellow-600">1위</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400 hover:bg-gray-500">2위</Badge>;
    if (rank === 3) return <Badge className="bg-amber-700 hover:bg-amber-800">3위</Badge>;
    return <Badge variant="outline">{rank}위</Badge>;
};

const RankingTable = ({ data, roleColor }: { data: RankedUser[], roleColor: string }) => (
    <div className="space-y-3">
        {data.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
                아직 해당 역할의 랭킹 데이터가 없습니다.
            </div>
        ) : (
            data.map((item) => (
                // item의 rank 속성은 RankedUser 타입 덕분에 안전하게 접근 가능
                <Card
                    key={item.userId}
                    className={`p-4 hover:shadow-lg transition-shadow ${
                        item.rank <= 3 ? 'border-2 ' + roleColor : ''
                    }`}
                >
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12">
                            {getRankIcon(item.rank)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3>{item.nickname}</h3>
                                {getRankBadge(item.rank)}
                            </div>
                            <div className="flex gap-6 text-sm text-muted-foreground">
                                <span>총 사건: {item.totalCases}건</span>
                                <span className="flex items-center gap-1">
                                    <TrendingUp className="size-3" />
                                    성공률: {item.successRate.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{item.score}</div>
                            <div className="text-xs text-muted-foreground">포인트</div>
                        </div>
                    </div>
                </Card>
            ))
        )}
    </div>
);

// --- RankingPage 메인 컴포넌트 ---

export function RankingPage({ onBack }: RankingPageProps) {
    // allRankings의 타입을 Dto 배열로 지정
    const [allRankings, setAllRankings] = useState<RankingDto[]>([]); 
    const [loading, setLoading] = useState(true);

    // 🚨 1. 전체 랭킹 조회 API 연동
    const fetchRankings = useCallback(async () => {
        setLoading(true);
        try {
            // API 호출 시 응답 타입은 RankingDto[]
            const response = await apiClient.get<RankingDto[]>('/ranking'); 
            
            setAllRankings(response.data);
        } catch (err: any) {
            toast.error("랭킹 정보를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRankings();
    }, [fetchRankings]);

    // 2. 역할별로 랭킹 분리 및 순위 계산 (프론트엔드에서 처리)
    // 반환 타입을 RankedUser[]로 명확히 지정
    const filterAndRank = (roleFilter: RankingDto['role']): RankedUser[] => {
        return allRankings
            .filter(item => item.role === roleFilter)
            // .map()을 통해 rank 속성 추가. 결과는 RankedUser 타입의 배열이 됨
            .map((item, index) => ({
                ...item,
                rank: index + 1, // rank 속성 추가
            })) as RankedUser[]; // 타입 단언을 통해 RankedUser[]임을 확정
    };

    const detectiveRankings = filterAndRank('탐정');
    const culpritRankings = filterAndRank('범인');
    const clientRankings = filterAndRank('의뢰인');
    
    // UI 렌더링 부분은 그대로 유지

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        onClick={onBack}
                        variant="outline"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                        <ArrowLeft className="size-4 mr-2" />
                        돌아가기
                    </Button>
                    <div>
                        <h1 className="text-white mb-2">명예의 전당</h1>
                        <p className="text-blue-200">최고의 의뢰인, 범인, 탐정을 확인하세요</p>
                    </div>
                </div>

                {loading ? (
                    <Card className="p-12 text-center text-blue-500 flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin size-6 mr-2" /> 랭킹 정보 로딩 중...
                    </Card>
                ) : (
                    <Card className="p-6">
                        <Tabs defaultValue="detective" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-6">
                                <TabsTrigger value="detective" className="flex items-center gap-2">
                                    <Search className="size-4" />
                                    탐정 랭킹
                                </TabsTrigger>
                                <TabsTrigger value="culprit" className="flex items-center gap-2">
                                    <Award className="size-4" />
                                    범인 랭킹
                                </TabsTrigger>
                                <TabsTrigger value="client" className="flex items-center gap-2">
                                    <Trophy className="size-4" />
                                    의뢰인 랭킹
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="detective">
                                <div className="mb-4">
                                    <h3 className="mb-2">탐정 순위</h3>
                                    <p className="text-sm text-muted-foreground">사건 해결 성공률과 총 해결 건수를 기반으로 한 순위입니다</p>
                                </div>
                                {/* RankedUser[] 타입이 전달되므로 안전 */}
                                <RankingTable data={detectiveRankings} roleColor="border-purple-500" />
                            </TabsContent>

                            <TabsContent value="culprit">
                                <div className="mb-4">
                                    <h3 className="mb-2">범인 순위</h3>
                                    <p className="text-sm text-muted-foreground">탐정을 속인 성공률과 참여 건수를 기반으로 한 순위입니다</p>
                                </div>
                                <RankingTable data={culpritRankings} roleColor="border-red-500" />
                            </TabsContent>

                            <TabsContent value="client">
                                <div className="mb-4">
                                    <h3 className="mb-2">의뢰인 순위</h3>
                                    <p className="text-sm text-muted-foreground">의뢰한 사건의 해결률과 총 의뢰 건수를 기반으로 한 순위입니다</p>
                                </div>
                                <RankingTable data={clientRankings} roleColor="border-blue-500" />
                            </TabsContent>
                        </Tabs>
                    </Card>
                )}


                {/* Statistics Cards */}
                {detectiveRankings.length > 0 && culpritRankings.length > 0 && clientRankings.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <h3>최고 탐정</h3>
                                <Trophy className="size-6" />
                            </div>
                            <p className="text-3xl font-bold mb-1">{detectiveRankings[0]?.nickname || '-'}</p>
                            <p className="text-purple-100 text-sm">
                                성공률: {detectiveRankings[0]?.successRate.toFixed(1) || 0}%
                            </p>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-red-500 to-red-600 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <h3>최강 범인</h3>
                                <Award className="size-6" />
                            </div>
                            <p className="text-3xl font-bold mb-1">{culpritRankings[0]?.nickname || '-'}</p>
                            <p className="text-red-100 text-sm">
                                성공률: {culpritRankings[0]?.successRate.toFixed(1) || 0}%
                            </p>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <h3>신뢰 의뢰인</h3>
                                <Medal className="size-6" />
                            </div>
                            <p className="text-3xl font-bold mb-1">{clientRankings[0]?.nickname || '-'}</p>
                            <p className="text-blue-100 text-sm">
                                성공률: {clientRankings[0]?.successRate.toFixed(1) || 0}%
                            </p>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}