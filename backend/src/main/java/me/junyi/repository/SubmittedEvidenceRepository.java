package me.junyi.repository;

import me.junyi.domain.*;
import org.springframework.data.repository.CrudRepository;
import java.util.List;

// 5. 제출된 증거 리포지토리
public interface SubmittedEvidenceRepository extends CrudRepository<SubmittedEvidence, Long> {
    List<SubmittedEvidence> findAllByCaseId(Long caseId);
}