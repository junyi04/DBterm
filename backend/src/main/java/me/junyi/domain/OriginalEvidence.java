package me.junyi.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("original_evidence")
public class OriginalEvidence {

    @Id
    private Long evidenceId;

    private Long caseId;
    private String description;

    @Column("is_true")
    @JsonProperty("isTrue")
    private Boolean isTrue;

    @Column("is_fake_candidate")
    @JsonProperty("isFakeCandidate")
    private Boolean isFakeCandidate;
}
