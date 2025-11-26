package me.junyi.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table("submitted_evidence")
public class SubmittedEvidence {

    @Id
    private Long submitId;

    private Long caseId;
    private String evidenceDescription;
    private Boolean isTrueEvidence;
}