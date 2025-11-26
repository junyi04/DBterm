package me.junyi.service;

import me.junyi.domain.AppUser;
import me.junyi.domain.CaseParticipation;
import me.junyi.repository.AppUserRepository;
import me.junyi.repository.CaseParticipationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import me.junyi.domain.ScoreLog;
import me.junyi.repository.ScoreLogRepository;

@Service
public class UserService {

    private final AppUserRepository appUserRepository;
    private final CaseParticipationRepository participationRepository;
    private final ScoreLogRepository scoreLogRepository;

    public UserService(AppUserRepository appUserRepository, CaseParticipationRepository participationRepository, ScoreLogRepository scoreLogRepository) {
        this.appUserRepository = appUserRepository;
        this.participationRepository = participationRepository;
        this.scoreLogRepository = scoreLogRepository;
    }

    public Optional<AppUser> findByNickname(String nickname) {
        return appUserRepository.findByNickname(nickname);
    }

    @Transactional
    public AppUser startCase(Long clientId, Long caseId) {
        // 1. CASE_PARTICIPATION 레코드 생성 (의뢰인 등록)
        CaseParticipation participation = CaseParticipation.builder()
                .caseId(caseId)
                .clientId(clientId)
                .build();
        participationRepository.save(participation);

        // 2. 의뢰인 점수 +1 업데이트
        AppUser client = appUserRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("의뢰인을 찾을 수 없습니다."));

        client.setScore(client.getScore() + 1);
        AppUser updatedClient = appUserRepository.save(client);

        // 3. SCORE_LOG 기록 (의뢰인 초기 점수 +1)
        ScoreLog log = ScoreLog.builder()
                .userId(clientId)
                .caseId(caseId)
                .scoreChange(1)
                .reason("사건 의뢰 시작 (초기 점수)")
                .build();
        scoreLogRepository.save(log);

        return updatedClient;
    }
}