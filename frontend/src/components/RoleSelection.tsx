import { useState, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { User, UserX, Shield, Search, Trophy, Loader2 } from 'lucide-react';
import type { Role, User as UserType } from '../App';
import { toast } from 'sonner'; 
import axios from 'axios';
import type { IUser } from '../types/api';


// API 클라이언트 인스턴스를 직접 생성 (프록시 설정 활용)
const apiClient = axios.create({ baseURL: '/api', withCredentials: true });

// NOTE: 이 코드는 Spring Boot의 /api/login 엔드포인트를 호출하며, 
// 서버는 IUser (userId, nickname, role, score) 타입을 반환해야 합니다.
const login = async (data: { nickname: string }): Promise<IUser> => {
    // 🚨 POST /api/login 호출
    const response = await apiClient.post<IUser>('/login', data);
    return response.data;
};

interface RoleSelectionProps {
    onRoleSelect: (role: Role, user: UserType) => void;
    onShowRanking: () => void;
}

export function RoleSelection({ onRoleSelect, onShowRanking }: RoleSelectionProps) {
    const [selectedRole, setSelectedRole] = useState<Role>(null);
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const roles = [
        { id: 'client' as Role, title: '의뢰인', description: '사건을 의뢰하고 결과를 확인합니다', icon: User, color: 'from-blue-500 to-blue-600' },
        { id: 'culprit' as Role, title: '범인', description: '거짓 증거를 조작합니다', icon: UserX, color: 'from-red-500 to-red-600' },
        { id: 'police' as Role, title: '경찰', description: '사건을 접수하고 탐정을 배정합니다', icon: Shield, color: 'from-green-500 to-green-600' },
        { id: 'detective' as Role, title: '탐정', description: '증거를 분석하고 범인을 추리합니다', icon: Search, color: 'from-purple-500 to-purple-600' },
    ];

    // 백엔드 역할 문자열을 프론트엔드 Role 타입으로 변환
    const mapRole = (beRole: string): Role => {
        switch (beRole) {
            case '의뢰인': return 'client';
            case '범인': return 'culprit';
            case '경찰': return 'police';
            case '탐정': return 'detective';
            default: return null;
        }
    };

    const handleLogin = useCallback(async () => {
        if (!selectedRole || !nickname.trim()) {
            setError('역할과 닉네임을 모두 선택/입력해주세요.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. 백엔드 로그인 API 호출
            const beUser: IUser = await login({ nickname: nickname.trim() });
            
            // 2. 역할 변환 및 유효성 검사
            const feRole = mapRole(beUser.role);

            if (!feRole) {
                 throw new Error("할당된 역할이 유효하지 않습니다: " + beUser.role);
            }
            
            // 3. DB에서 가져온 역할과 사용자가 선택한 역할이 일치하는지 확인
            if (feRole !== selectedRole) {
                // 이 에러는 DB에 사용자는 있으나 다른 역할로 등록되어 있음을 의미합니다.
                throw new Error(`[${beUser.nickname}]님은 이미 ${beUser.role} 역할로 등록되어 있습니다. 해당 역할을 선택해주세요.`);
            }

            // 4. App.tsx가 필요로 하는 UserType 형식으로 변환 (score 포함)
            const currentUser: UserType = {
                id: beUser.userId,
                nickname: beUser.nickname,
                role: feRole,
                score: beUser.score,
            };

            // 5. 로그인 성공 후 상태 업데이트
            toast.success(`${currentUser.nickname}님, ${roles.find(r => r.id === feRole)?.title} 역할로 접속했습니다.`);
            onRoleSelect(feRole, currentUser);

        } catch (err: any) {
            const errorMessage = err.message || err.response?.data?.message || '로그인 실패: 서버와 통신할 수 없습니다.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [selectedRole, nickname, onRoleSelect]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-white mb-4">명탐정 코난 추리 시스템</h1>
                    <p className="text-blue-200 text-lg">진실은 언제나 하나! 역할을 선택하고 추리를 시작하세요.</p>
                </div>

                <div className="flex justify-end mb-8">
                    <Button
                        onClick={onShowRanking}
                        variant="outline"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        disabled={loading}
                    >
                        <Trophy className="size-4 mr-2" />
                        랭킹 보기
                    </Button>
                </div>

                {/* 역할 선택 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {roles.map((role) => {
                        const Icon = role.icon;
                        return (
                            <Card
                                key={role.id}
                                className={`cursor-pointer transition-all hover:scale-105 bg-white/5 border-white/20 text-white ${
                                    selectedRole === role.id
                                        ? 'ring-4 ring-blue-400 shadow-2xl scale-[1.02]'
                                        : 'hover:shadow-xl hover:border-blue-300'
                                }`}
                                onClick={() => setSelectedRole(role.id)}
                            >
                                <div className={`h-32 bg-gradient-to-br ${role.color} rounded-t-lg flex items-center justify-center`}>
                                    <Icon className="size-16 text-white" />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-center mb-2">{role.title}</h3>
                                    <p className="text-blue-200 text-center text-sm">
                                        {role.description}
                                    </p>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* 닉네임 입력 및 로그인 버튼 */}
                {selectedRole && (
                    <Card className="max-w-md mx-auto p-6 bg-white/95 backdrop-blur border-slate-300">
                        <h3 className="mb-4 text-center text-lg font-bold text-gray-800">
                            {roles.find(r => r.id === selectedRole)?.title} 역할로 접속
                        </h3>
                        <div className="space-y-4">
                            <Input
                                placeholder="닉네임을 입력하세요 (예: 코난)"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                className="text-center text-gray-900"
                                disabled={loading}
                            />
                            {error && <p className="text-red-600 text-sm text-center font-medium">{error}</p>}
                            <Button
                                onClick={handleLogin}
                                disabled={!nickname.trim() || loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
                            >
                                {loading ? (
                                    <><Loader2 className="size-4 mr-2 animate-spin" /> 로그인 처리 중</>
                                ) : (
                                    '시작하기'
                                )}
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}