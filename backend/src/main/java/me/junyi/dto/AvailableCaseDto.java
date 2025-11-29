package me.junyi.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AvailableCaseDto {
    private Long caseId;
    private Long activeId;
    private String caseTitle;
    private String caseDescription;
    private String clientNickname;
    private Integer difficulty;
}
