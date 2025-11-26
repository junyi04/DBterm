package me.junyi.domain;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("app_user")
public class AppUser {

    @Id
    private Long userId;

    private String nickname;
    private String role;
    private Integer score;
}