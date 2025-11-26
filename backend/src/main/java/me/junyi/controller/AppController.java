package me.junyi.controller;

import me.junyi.domain.AppUser;
import me.junyi.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AppController {

    private final UserService userService;

    public AppController(UserService userService) {
        this.userService = userService;
    }

    // 1. 로그인 및 사용자 정보 조회
    // URL: POST /api/login
    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody Map<String, String> request) {
        String nickname = request.get("nickname");

        return userService.findByNickname(nickname)
                // 성공 시: AppUser 객체를 받아서 ResponseEntity를 생성합니다.
                // ResponseEntity.ok().body(user)를 사용하여 바디만 Object로 처리되도록 합니다.
                .map(user -> ResponseEntity.ok().body((Object)user))

                // 실패 시: 404 에러 Map을 반환합니다.
                .orElseGet(() ->
                        ResponseEntity.status(404).body(Map.of("message", "User not found"))
                );
    }

    // 2. 사건 의뢰 시작
    // URL: POST /api/case/start
    @PostMapping("/case/start")
    public ResponseEntity<?> startCase(@RequestBody Map<String, Long> request) {
        Long clientId = request.get("clientId");
        Long caseId = request.get("caseId");

        if (clientId == null || caseId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "ID는 필수입니다."));
        }

        try {
            AppUser updatedClient = userService.startCase(clientId, caseId);
            return ResponseEntity.ok(Map.of("message", "사건 등록 성공", "newScore", updatedClient.getScore()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "DB 처리 중 오류: " + e.getMessage()));
        }
    }
}