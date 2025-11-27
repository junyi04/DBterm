// src/types/api.ts

// --- 1. 로그인 요청 타입 ---
// AppController.login에서 nickname을 요청합니다.
export interface ILoginRequest {
  nickname: string;
}

// --- 2. 로그인 응답 타입 (AppUser 엔티티와 일치) ---
// RoleSelection에서 사용되며, 백엔드 AppUser 엔티티의 구조와 일치해야 합니다.
export interface IUser {
  userId: number; // long -> number
  nickname: string;
  role: string; // '의뢰인', '범인', '경찰', '탐정' (백엔드 문자열)
  score: number; // integer
}