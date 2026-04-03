CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    summary TEXT,
    score INT NOT NULL DEFAULT 0,
    issues_json TEXT,
    security_audit_json TEXT,
    total_issues INT NOT NULL DEFAULT 0,
    critical INT NOT NULL DEFAULT 0,
    high INT NOT NULL DEFAULT 0,
    medium INT NOT NULL DEFAULT 0,
    low INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
