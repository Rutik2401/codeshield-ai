package com.codeshield.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class UserInfo {
    private String id;
    private String name;
    private String email;
    private String avatar;
}
