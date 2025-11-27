package me.junyi.repository;

import me.junyi.domain.*;
import org.springframework.data.repository.CrudRepository;
import java.util.List;
import java.util.Optional;

// 4. 증거 원본 리포지토리
public interface OriginalEvidenceRepository extends CrudRepository<OriginalEvidence, Long> {

    // 특정 사건의 거짓 증거 후보 3개를 조회할 때 사용
    List<OriginalEvidence> findByCaseIdAndIsFakeCandidate(Long caseId, Boolean isFakeCandidate);

    // 🚨 [추가됨] 특정 사건의 모든 OriginalEvidence를 조회할 때 사용
    List<OriginalEvidence> findAllByCaseId(Long caseId);
}