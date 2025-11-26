package me.junyi.repository;

import me.junyi.domain.ScoreLog;
import org.springframework.data.repository.CrudRepository;

public interface ScoreLogRepository extends CrudRepository<ScoreLog, Long> {
    // 랭킹 페이지에서 특정 사용자의 점수 내역을 조회하는 메서드 등이 추가될 수 있습니다.
}