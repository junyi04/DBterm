package me.junyi.domain;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Builder
@Table("case_participation")
public class CaseParticipation {

    @Id
    private Long partId;

    private Long caseId;
    private Long clientId;
    private Long criminalId; // NULL 허용됨
    private Long policeId;   // NULL 허용됨
    private Long detectiveId; // NULL 허용됨

    private Long detectiveGuessId;
    private Boolean isSolved;
}