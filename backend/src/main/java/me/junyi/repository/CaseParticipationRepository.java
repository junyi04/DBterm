package me.junyi.repository;

import me.junyi.domain.*;
import org.springframework.data.repository.CrudRepository;
import java.util.List;
import java.util.Optional;

// 3. 사건 참여 리포지토리
public interface CaseParticipationRepository extends CrudRepository<CaseParticipation, Long> {
    List<CaseParticipation> findAllByClientId(Long clientId);
    Optional<CaseParticipation> findByCaseId(Long caseId);
    List<CaseParticipation> findAllByCriminalId(Long criminalId);
    List<CaseParticipation> findAllByDetectiveId(Long detectiveId);
}