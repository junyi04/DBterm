package me.junyi.service;

import me.junyi.domain.*;
import me.junyi.dto.CaseClientDto;
import me.junyi.dto.CaseDetectiveDto;
import me.junyi.repository.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CaseService {

    private final CaseInfoRepository caseInfoRepository;
    private final CaseParticipationRepository participationRepository;
    private final OriginalEvidenceRepository originalEvidenceRepository;
    private final SubmittedEvidenceRepository submittedEvidenceRepository;
    private final ScoreLogRepository scoreLogRepository; // SCORE_LOG Repository
    private final AppUserRepository appUserRepository;
    private final JdbcTemplate jdbcTemplate; // Native Query를 위한 JdbcTemplate

    // 🚨 생성자 문법 수정 및 모든 필드 주입
    public CaseService(CaseInfoRepository caseInfoRepository, CaseParticipationRepository participationRepository,
                       OriginalEvidenceRepository originalEvidenceRepository, SubmittedEvidenceRepository submittedEvidenceRepository,
                       AppUserRepository appUserRepository, JdbcTemplate jdbcTemplate, ScoreLogRepository scoreLogRepository) {
        this.caseInfoRepository = caseInfoRepository;
        this.participationRepository = participationRepository;
        this.originalEvidenceRepository = originalEvidenceRepository;
        this.submittedEvidenceRepository = submittedEvidenceRepository;
        this.appUserRepository = appUserRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.scoreLogRepository = scoreLogRepository;
    } // 🚨 닫는 중괄호 추가!


    /** 1. 사건 목록 조회 (STATUS='등록') */
    public List<CaseInfo> getAvailableCases() {
        return caseInfoRepository.findAllByStatus("등록");
    }

    // ... (JdbcTemplate을 사용하는 getClientCases 메서드는 이전에 구현되어 있다고 가정) ...


    /** 2. 범인의 증거 조작 처리 (CRIMINAL_ID 등록, 증거 구성, STATUS='조작') */
    @Transactional
    public CaseInfo handleCriminalAction(Long caseId, Long criminalId, String fakeEvidenceDescription) {
        // A. 참여 정보 업데이트 (CRIMINAL_ID 등록 및 점수 +1)
        CaseParticipation participation = participationRepository.findByCaseId(caseId)
                .orElseThrow(() -> new IllegalArgumentException("참여 레코드가 없습니다."));

        participation.setCriminalId(criminalId);
        participationRepository.save(participation);

        AppUser criminal = appUserRepository.findById(criminalId).orElseThrow();
        criminal.setScore(criminal.getScore() + 1);
        appUserRepository.save(criminal);

        // 🚨 SCORE_LOG 기록 (범인 초기 점수 +1)
        ScoreLog log = ScoreLog.builder()
                .userId(criminalId)
                .caseId(caseId)
                .scoreChange(1)
                .reason("범인 지정 및 증거 조작 (초기 점수)")
                .build();
        scoreLogRepository.save(log);

        // B. 제출 증거 구성 (진짜 3개 + 선택된 거짓 1개)
        List<OriginalEvidence> trueEvidences = originalEvidenceRepository.findByCaseIdAndIsFakeCandidate(caseId, false);
        OriginalEvidence selectedFake = originalEvidenceRepository.findByCaseIdAndIsFakeCandidate(caseId, true).stream()
                .filter(e -> e.getDescription().equals(fakeEvidenceDescription))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("선택한 거짓 증거를 찾을 수 없습니다."));

        submittedEvidenceRepository.deleteAll(submittedEvidenceRepository.findAllByCaseId(caseId));

        List<SubmittedEvidence> submittedList = trueEvidences.stream()
                .map(e -> new SubmittedEvidence(null, e.getCaseId(), e.getDescription(), e.getIsTrue()))
                .collect(Collectors.toList());

        submittedList.add(new SubmittedEvidence(null, selectedFake.getCaseId(), selectedFake.getDescription(), selectedFake.getIsTrue()));

        submittedEvidenceRepository.saveAll(submittedList);

        // C. 사건 상태 업데이트
        CaseInfo caseInfo = caseInfoRepository.findById(caseId).orElseThrow();
        caseInfo.setStatus("조작");
        return caseInfoRepository.save(caseInfo);
    }

    /** 3. 경찰의 탐정 배정 및 상태 변경 처리 (POLICE_ID, DETECTIVE_ID 등록, STATUS='배정') */
    @Transactional
    public CaseInfo handlePoliceAssignment(Long caseId, Long policeId, Long detectiveId) {
        // A. 참여 정보 업데이트 (경찰, 탐정 ID 등록 및 점수 부여)
        CaseParticipation participation = participationRepository.findByCaseId(caseId)
                .orElseThrow(() -> new IllegalArgumentException("참여 레코드를 찾을 수 없습니다."));

        participation.setPoliceId(policeId);
        participation.setDetectiveId(detectiveId);
        participationRepository.save(participation);

        // B. 경찰 점수 +2, 탐정 점수 +1 업데이트
        updateUserScore(policeId, 2, caseId, "경찰 배정 (초기 점수)");
        updateUserScore(detectiveId, 1, caseId, "탐정 배정 (초기 점수)");

        // C. 사건 상태 업데이트: '배정'
        CaseInfo caseInfo = caseInfoRepository.findById(caseId).orElseThrow();
        caseInfo.setStatus("배정");
        return caseInfoRepository.save(caseInfo);
    }

    // 헬퍼 메서드: 점수 업데이트 및 로그 기록 (SCORE_LOG 추가)
    private void updateUserScore(Long userId, int scoreChange, Long caseId, String reason) {
        AppUser user = appUserRepository.findById(userId).orElseThrow();
        user.setScore(user.getScore() + scoreChange);
        appUserRepository.save(user);

        // 🚨 SCORE_LOG 기록
        ScoreLog log = ScoreLog.builder()
                .userId(userId)
                .caseId(caseId)
                .scoreChange(scoreChange)
                .reason(reason)
                .build();
        scoreLogRepository.save(log);
    }

    /** 4. 탐정 - 배정된 사건 조회 (STATUS='배정') */
    public List<CaseDetectiveDto> getAssignedCasesByDetectiveId(Long detectiveId) {
        // TODO: CaseParticipation과 CaseInfo를 조인하여 detectiveId와 status='배정'인 레코드를 찾고 CaseDetectiveDto로 변환하는 로직 구현 필요
        return List.of(); // 임시 반환
    }

    /** 5. 탐정 - 완료된 사건 결과 조회 (STATUS='결과 확인') */
    public List<CaseDetectiveDto> getCompletedCasesByDetectiveId(Long detectiveId) {
        // TODO: CaseParticipation과 CaseInfo, CaseResult를 조인하여 status='결과 확인'인 레코드를 찾고 DTO로 변환하는 로직 구현 필요
        return List.of(); // 임시 반환
    }

    // 6. 의뢰인 - 의뢰한 사건 조회
    public List<CaseClientDto> getCasesByClientId(Long clientId) {
        // TODO: CaseParticipation과 CaseInfo를 조인하여 clientId가 일치하는 사건을 CaseClientDto로 변환하는 로직 구현 필요
        return List.of(); // 임시 반환
    }

    // 7. 경찰 - 탐정 배정 대기 중인 사건 조회 (STATUS='조작')
    public List<CaseInfo> getPendingCasesForPolice() {
        return caseInfoRepository.findAllByStatus("조작"); // STATUS가 '조작'인 사건 반환
    }

    // 8. 범인 - 조작 참여 가능 사건 조회 (STATUS='등록')
    public List<CaseInfo> getAvailableCasesForCulprit() {
        return caseInfoRepository.findAllByStatus("등록"); // STATUS가 '등록'인 사건 반환
    }

    // 9. 범인 - 참여한 사건 조회
    public List<CaseInfo> getCasesByCulpritId(Long culpritId) {
        // TODO: CaseParticipation과 CaseInfo를 조인하여 culpritId가 일치하는 사건을 CaseInfo로 반환하는 로직 구현 필요
        return List.of(); // 임시 반환
    }
}