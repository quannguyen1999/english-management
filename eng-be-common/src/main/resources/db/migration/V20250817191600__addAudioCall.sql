-- Create audio_calls table for storing audio call information
CREATE TABLE IF NOT EXISTS audio_calls (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    conversation_id VARCHAR(36) NOT NULL,
    caller_id VARCHAR(36) NOT NULL,
    callee_id VARCHAR(36) NOT NULL,
    call_type VARCHAR(10) NOT NULL CHECK (call_type IN ('AUDIO', 'VIDEO')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('INITIATED', 'RINGING', 'CONNECTED', 'ENDED', 'REJECTED')),
    offer_sdp LONGTEXT,
    answer_sdp LONGTEXT,
    initiated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP NULL,
    ended_at TIMESTAMP NULL,
    duration BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_audio_calls_conversation_id ON audio_calls(conversation_id);
CREATE INDEX idx_audio_calls_caller_id ON audio_calls(caller_id);
CREATE INDEX idx_audio_calls_callee_id ON audio_calls(callee_id);
CREATE INDEX idx_audio_calls_status ON audio_calls(status);
CREATE INDEX idx_audio_calls_initiated_at ON audio_calls(initiated_at);

-- Add foreign key constraints (assuming users and conversations tables exist)
-- ALTER TABLE audio_calls ADD CONSTRAINT fk_audio_calls_conversation_id 
--     FOREIGN KEY (conversation_id) REFERENCES conversations(id);
-- ALTER TABLE audio_calls ADD CONSTRAINT fk_audio_calls_caller_id 
--     FOREIGN KEY (caller_id) REFERENCES users(id);
-- ALTER TABLE audio_calls ADD CONSTRAINT fk_audio_calls_callee_id 
--     FOREIGN KEY (callee_id) REFERENCES users(id);