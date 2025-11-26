package me.junyi.dto;

// Lombok 사용을 가정하여 @Getter, @Setter, @Builder, @NoArgsConstructor, @AllArgsConstructor를 추가합니다.

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaseClientDto {
    // 1. 사건 자체의 고유 ID
    private Long caseId;

    // 2. 활성화된 참여 정보 ID (프론트엔드 key)
    private Long activeId;

    // 3. 사건 상세 정보
    private String caseTitle;
    private String caseDescription;
    private Integer difficulty; // 난이도 (1~5)

    // 4. 배정된 탐정 정보
    private String detectiveNickname; // 배정된 탐정의 닉네임

    // 5. 사건 진행 상태 및 결과
    private String status;         // '등록', '조작', '배정', '추리 완료', '결과 확인'
    private String result;         // '감사' (해결) 또는 '부고' (미해결)
}