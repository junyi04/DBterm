package me.junyi.controller;

import me.junyi.domain.CaseInfo;
import me.junyi.dto.CaseClientDto;
import me.junyi.dto.CaseDetectiveDto;
import me.junyi.service.CaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cases")
public class CaseController {

    private final CaseService caseService;

    public CaseController(CaseService caseService) {
        this.caseService = caseService;
    }

    // 1. 사건 목록 조회 (의뢰인이 선택할 '등록' 상태의 사건)
    // URL: GET /api/cases/available
    @GetMapping("/available")
    public List<CaseInfo> getAvailableCases() {
        return caseService.getAvailableCases();
    }

    // 2. 범인의 조작 액션 (거짓 증거 선택 및 상태 변경)
    // URL: POST /api/cases/fabricate
    @PostMapping("/fabricate")
    public ResponseEntity<?> fabricateEvidence(@RequestBody Map<String, Object> request) {
        Long caseId = ((Number) request.get("caseId")).longValue();
        Long criminalId = ((Number) request.get("criminalId")).longValue();
        String fakeEvidence = (String) request.get("fakeEvidence");

        try {
            CaseInfo updatedCase = caseService.handleCriminalAction(caseId, criminalId, fakeEvidence);
            return ResponseEntity.ok(Map.of("message", "증거 조작 및 상태 변경 성공", "newStatus", updatedCase.getStatus()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "조작 중 DB 오류: " + e.getMessage()));
        }
    }

    // 3. 경찰의 탐정 배정 및 상태 변경 액션
    // URL: POST /api/cases/assign
    @PostMapping("/assign")
    public ResponseEntity<?> assignDetective(@RequestBody Map<String, Long> request) {
        Long caseId = request.get("caseId");
        Long policeId = request.get("policeId");
        Long detectiveId = request.get("detectiveId");

        if (caseId == null || policeId == null || detectiveId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "모든 ID는 필수입니다."));
        }

        try {
            CaseInfo updatedCase = caseService.handlePoliceAssignment(caseId, policeId, detectiveId);
            return ResponseEntity.ok(Map.of("message", "탐정 배정 및 상태 변경 성공", "newStatus", updatedCase.getStatus()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "배정 중 DB 오류: " + e.getMessage()));
        }
    }
    // 4. 탐정 - 배정된 사건 조회 (DetectiveDashboard)
    // URL: GET /api/cases/detective/{userId}
    @GetMapping("/detective/{userId}")
    public List<CaseDetectiveDto> getAssignedCasesForDetective(@PathVariable Long userId) {
        return caseService.getAssignedCasesByDetectiveId(userId); // 🚨 CaseService에 구현 필요
    }

    // 5. 탐정 - 완료된 사건 결과 조회
    // URL: GET /api/cases/detective/result/{userId}
    @GetMapping("/detective/result/{userId}")
    public List<CaseDetectiveDto> getCompletedCasesForDetective(@PathVariable Long userId) {
        return caseService.getCompletedCasesByDetectiveId(userId); // 🚨 CaseService에 구현 필요
    }

    // 6. 의뢰인 - 의뢰한 사건 조회 (ClientDashboard)
    // URL: GET /api/cases/client/{userId}
    @GetMapping("/client/{userId}")
    public List<CaseClientDto> getCasesByClient(@PathVariable Long userId) {
        return caseService.getCasesByClientId(userId); // 🚨 CaseService에 구현 필요
    }

    // 7. 경찰 - 탐정 배정 대기 중인 사건 조회 (PoliceDashboard)
    // URL: GET /api/cases/police/pending
    @GetMapping("/police/pending")
    public List<CaseInfo> getPendingCases() {
        return caseService.getPendingCasesForPolice(); // 🚨 CaseService에 구현 필요
    }

    // 8. 범인 - 조작 참여 가능 사건 조회 (CulpritDashboard)
    // URL: GET /api/cases/culprit/available
    @GetMapping("/culprit/available")
    public List<CaseInfo> getAvailableCasesForCulprit() {
        return caseService.getAvailableCasesForCulprit(); // 🚨 CaseService에 구현 필요
    }

    // 9. 범인 - 참여한 사건 조회
    // URL: GET /api/cases/culprit/{userId}
    @GetMapping("/culprit/{userId}")
    public List<CaseInfo> getCasesByCulprit(@PathVariable Long userId) {
        return caseService.getCasesByCulpritId(userId); // 🚨 CaseService에 구현 필요
    }

}