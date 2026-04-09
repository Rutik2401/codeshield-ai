CREATE TABLE connected_repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    github_repo_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(512) NOT NULL,
    owner VARCHAR(255) NOT NULL,
    default_branch VARCHAR(100) DEFAULT 'main',
    is_private BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    auto_review BOOLEAN DEFAULT true,
    webhook_id BIGINT,
    github_access_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, github_repo_id)
);

CREATE INDEX idx_connected_repos_user_id ON connected_repositories(user_id);
CREATE INDEX idx_connected_repos_github_id ON connected_repositories(github_repo_id);
