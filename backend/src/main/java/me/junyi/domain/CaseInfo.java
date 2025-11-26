package me.junyi.domain;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("case_info")
public class CaseInfo {

    @Id
    private Long caseId;

    private String title;
    private String content;
    private Integer difficulty;
    private Long trueCriminalId;
    private String status; // '등록', '조작', '배정' 등 워크플로우 상태
}