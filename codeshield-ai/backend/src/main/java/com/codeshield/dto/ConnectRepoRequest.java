package com.codeshield.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ConnectRepoRequest {
    @NotNull
    private Long githubRepoId;

    @NotBlank
    private String name;

    @NotBlank
    private String fullName;

    @NotBlank
    private String owner;

    private String defaultBranch = "main";
    private boolean isPrivate;
}
