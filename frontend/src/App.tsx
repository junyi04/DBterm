import { useState } from 'react';
import { RoleSelection } from './components/RoleSelection';
import { ClientDashboard } from './components/ClientDashboard';
import { CulpritDashboard } from './components/CulpritDashboard';
import { PoliceDashboard } from './components/PoliceDashboard';
import { DetectiveDashboard } from './components/DetectiveDashboard';
import { RankingPage } from './components/RankingPage';

export type Role = 'client' | 'culprit' | 'police' | 'detective' | null;

export interface User {
    id: number;
    nickname: string;
    role: Role;
    score: number; // 🚨 SCORE 추가
}

export default function App() {
    const [currentRole, setCurrentRole] = useState<Role>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [showRanking, setShowRanking] = useState(false);

    const handleRoleSelect = (role: Role, user: User) => {
        setCurrentRole(role);
        setCurrentUser(user);
        setShowRanking(false);
    };

    const handleLogout = () => {
        setCurrentRole(null);
        setCurrentUser(null);
        setShowRanking(false);
    };

    const handleShowRanking = () => {
        setShowRanking(true);
    };

    const handleBackFromRanking = () => {
        setShowRanking(false);
    };

    if (showRanking) {
        return <RankingPage onBack={handleBackFromRanking} />;
    }

    if (!currentRole || !currentUser) {
        return <RoleSelection onRoleSelect={handleRoleSelect} onShowRanking={handleShowRanking} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
            {currentRole === 'client' && (
                <ClientDashboard user={currentUser} onLogout={handleLogout} onShowRanking={handleShowRanking} />
            )}
            {currentRole === 'culprit' && (
                <CulpritDashboard user={currentUser} onLogout={handleLogout} onShowRanking={handleShowRanking} />
            )}
            {currentRole === 'police' && (
                <PoliceDashboard user={currentUser} onLogout={handleLogout} onShowRanking={handleShowRanking} />
            )}
            {currentRole === 'detective' && (
                <DetectiveDashboard user={currentUser} onLogout={handleLogout} onShowRanking={handleShowRanking} />
            )}
        </div>
    );
}