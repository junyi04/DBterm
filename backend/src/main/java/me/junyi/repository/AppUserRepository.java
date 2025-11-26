package me.junyi.repository;

import me.junyi.domain.*;
import org.springframework.data.repository.CrudRepository;
import java.util.Optional;

// 1. 사용자 리포지토리
public interface AppUserRepository extends CrudRepository<AppUser, Long> {
    Optional<AppUser> findByNickname(String nickname);
}