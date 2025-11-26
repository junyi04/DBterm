package me.junyi.dto;

// Lombok 사용을 가정하여 @Getter, @Setter, @Builder, @NoArgsConstructor, @AllArgsConstructor를 추가합니다.
// 만약 Lombok을 사용하지 않는다면, 생성자와 Getter/Setter 메서드를 수동으로 정의해야 합니다.

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaseDetectiveDto {
    // 1. 사건 자체의 고유 ID (조회 시 사용)
    private Long caseId;

    // 2. 활성화된 배정 정보 ID (주로 프론트엔드 key로 사용)
    private Long activeId;

    // 3. 사건 상세 정보
    private String caseTitle;
    private String caseDescription;
    private Integer difficulty; // 난이도 (1~5)

    // 4. 관련자 닉네임
    private String clientNickname;
    private String policeNickname;

    // 5. 탐정의 추리 및 결과
    private String status;         // '배정', '추리 완료', '결과 확인'
    private String culpritGuess;   // 탐정의 추리 결과 (용의자 닉네임)
    private String actualCulprit;  // 실제 범인 (결과 확인 시 필요)
    private String result;         // '감사' (성공) 또는 '부고' (실패)
}