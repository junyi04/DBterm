package me.junyi.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ranking")
public class RankingController {

    private final JdbcTemplate jdbcTemplate;

    public RankingController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // 🚨 탐정 목록 조회 (탐정 랭킹)
    @GetMapping("/detectives")
    public List<Map<String, Object>> getDetectives() {

        String sql = """
            SELECT 
                u.user_id AS "userId",
                u.nickname AS "nickname",
                u.score AS "score",
                COUNT(p.part_id) AS "totalCases",
                COALESCE(
                    AVG(CASE WHEN p.is_solved = TRUE THEN 1 ELSE 0 END) * 100,
                    0
                ) AS "successRate"
            FROM app_user u
            LEFT JOIN case_participation p
                ON u.user_id = p.detective_id
            WHERE u.role = '탐정'
            GROUP BY u.user_id, u.nickname, u.score
            ORDER BY u.score DESC;
        """;

        List<Map<String, Object>> list = jdbcTemplate.queryForList(sql);

        // 순위 계산
        int rank = 1;
        for (Map<String, Object> row : list) {
            row.put("rank", rank++);
        }

        return list;
    }
}
