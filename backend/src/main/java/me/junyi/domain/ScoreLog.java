package me.junyi.domain;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import java.time.LocalDateTime;

@Data
@Builder
@Table("score_log")
public class ScoreLog {

    @Id
    private Long logId;

    private Long userId;
    private Long caseId;
    private Integer scoreChange; // 점수 변경량 (+ 또는 - 값)
    private String reason; // 변경 사유

    @Builder.Default
    private LocalDateTime logTime = LocalDateTime.now(); // 현재 시간 자동 기록
}