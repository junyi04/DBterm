package me.junyi.repository;

import me.junyi.domain.*;
import org.springframework.data.repository.CrudRepository;
import java.util.List;
import java.util.Optional;

// 2. 사건 정보 리포지토리
public interface CaseInfoRepository extends CrudRepository<CaseInfo, Long> {
    List<CaseInfo> findAllByStatus(String status);
    Optional<CaseInfo> findByTitle(String title);
    List<CaseInfo> findAllByStatusIn(List<String> statuses);
}