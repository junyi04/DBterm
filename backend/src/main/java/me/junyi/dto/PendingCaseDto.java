package me.junyi.dto;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PendingCaseDto {
    private Long activeId;
    private Long caseId;
    private String caseTitle;
    private String caseDescription;
    private String clientNickname;
    private String culpritNickname;
    private String status;
    private Integer difficulty;
}
