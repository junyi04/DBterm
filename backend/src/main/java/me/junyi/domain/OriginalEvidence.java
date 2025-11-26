package me.junyi.domain;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("original_evidence")
public class OriginalEvidence {

    @Id
    private Long evidenceId;

    private Long caseId;
    private String description;
    private Boolean isTrue; // 진짜 증거 여부
    private Boolean isFakeCandidate; // 거짓 증거 후보 여부
}