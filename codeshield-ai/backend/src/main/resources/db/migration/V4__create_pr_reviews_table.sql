CREATE TABLE pr_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_id UUID NOT NULL REFERENCES connected_repositories(id) ON DELETE CASCADE,
    pr_number INT NOT NULL,
    pr_title VARCHAR(512),
    pr_author VARCHAR(255),
    head_sha VARCHAR(40),
    status VARCHAR(20) DEFAULT 'PENDING',
    score INT DEFAULT 0,
    total_issues INT DEFAULT 0,
    critical INT DEFAULT 0,
    high INT DEFAULT 0,
    medium INT DEFAULT 0,
    low INT DEFAULT 0,
    files_reviewed INT DEFAULT 0,
    review_result_json TEXT,
    github_review_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_pr_reviews_repo_id ON pr_reviews(repository_id);
CREATE INDEX idx_pr_reviews_pr_number ON pr_reviews(pr_number);
CREATE INDEX idx_pr_reviews_created_at ON pr_reviews(created_at DESC);
