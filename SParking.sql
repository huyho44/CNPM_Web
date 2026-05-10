CREATE TABLE users (
    id            CHAR(36)      PRIMARY KEY,           
    university_id VARCHAR(20)   UNIQUE NOT NULL,        
    full_name     VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  UNIQUE,
    role          ENUM(
                    'LEARNER',
                    'FACULTY',
                    'STAFF'
                  )             NOT NULL,
    sub_role      VARCHAR(50),                         
    faculty_unit  VARCHAR(100),                         
    status        ENUM(
                    'ACTIVE',
                    'INACTIVE',
                    'SUSPENDED'
                  )             NOT NULL DEFAULT 'ACTIVE',
    synced_at     DATETIME      NOT NULL,              
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE rfid_cards (
    id          CHAR(36)     PRIMARY KEY,
    card_uid    VARCHAR(64)  UNIQUE NOT NULL,   
    user_id     CHAR(36)     NOT NULL,
    status      ENUM(
                  'ACTIVE',
                  'REVOKED',
                  'LOST'
                )            NOT NULL DEFAULT 'ACTIVE',
    issued_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at  DATETIME,

    CONSTRAINT fk_rfid_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE parking_zones (
    id             CHAR(36)     PRIMARY KEY,
    name           VARCHAR(50)  NOT NULL,         
    description    VARCHAR(200),
    total_capacity INT          NOT NULL,
    status         ENUM(
                     'OPEN',
                     'CLOSED',
                     'MAINTENANCE'
                   )            NOT NULL DEFAULT 'OPEN',
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE parking_slots (
    id            CHAR(36)     PRIMARY KEY,
    zone_id       CHAR(36)     NOT NULL,
    slot_code     VARCHAR(20)  NOT NULL,        
    status        ENUM(
                    'AVAILABLE',
                    'OCCUPIED',
                    'MAINTENANCE',
                    'RESERVED'
                  )            NOT NULL DEFAULT 'AVAILABLE',
    last_updated  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_slot_zone
        FOREIGN KEY (zone_id) REFERENCES parking_zones(id),
    CONSTRAINT uq_slot_code_zone
        UNIQUE (zone_id, slot_code)
);

CREATE TABLE gates (
    id          CHAR(36)     PRIMARY KEY,
    zone_id     CHAR(36)     NOT NULL,
    gate_code   VARCHAR(20)  NOT NULL UNIQUE,   -- e.g. "GATE-A-IN", "GATE-A-OUT"
    direction   ENUM(
                  'ENTRY',
                  'EXIT',
                  'BOTH'
                )            NOT NULL,
    status      ENUM(
                  'ONLINE',
                  'OFFLINE',
                  'FAULT'
                )            NOT NULL DEFAULT 'ONLINE',
    location    VARCHAR(200),
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_gate_zone
        FOREIGN KEY (zone_id) REFERENCES parking_zones(id)
);

CREATE TABLE parking_sessions (
    id              CHAR(36)     PRIMARY KEY,
    user_id         CHAR(36),
    ticket_id       CHAR(36),


    entry_gate_id   CHAR(36)     NOT NULL,
    entry_time      DATETIME     NOT NULL,
    entry_method    ENUM(
                      'RFID',
                      'TEMPORARY_TICKET',
                      'OPERATOR_OVERRIDE'
                    )            NOT NULL,


    exit_gate_id    CHAR(36),
    exit_time       DATETIME,

    slot_id         CHAR(36),

    status          ENUM(
                      'ACTIVE',
                      'COMPLETED',
                      'ABANDONED',
                      'EXCEPTION'
                    )            NOT NULL DEFAULT 'ACTIVE',

    user_role       ENUM('LEARNER', 'FACULTY', 'STAFF', 'VISITOR'),
    card_uid        VARCHAR(64),       

    -- Duration and fee (calculated at exit)
    duration_minutes INT,
    fee_applicable  BOOLEAN      NOT NULL DEFAULT TRUE,

    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_session_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_session_entry_gate
        FOREIGN KEY (entry_gate_id) REFERENCES gates(id),
    CONSTRAINT fk_session_exit_gate
        FOREIGN KEY (exit_gate_id) REFERENCES gates(id),
    CONSTRAINT fk_session_slot
        FOREIGN KEY (slot_id) REFERENCES parking_slots(id)
);

CREATE TABLE temporary_tickets (
    id              CHAR(36)     PRIMARY KEY,
    ticket_code     VARCHAR(64)  UNIQUE NOT NULL, 
    entry_gate_id   CHAR(36)     NOT NULL,
    issued_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    issued_by       ENUM(
                      'KIOSK',
                      'OPERATOR'
                    )            NOT NULL DEFAULT 'KIOSK',
    operator_id     CHAR(36),                      
    status          ENUM(
                      'ACTIVE',
                      'USED',
                      'EXPIRED',
                      'VOID'
                    )            NOT NULL DEFAULT 'ACTIVE',
    used_at         DATETIME,                      
    expires_at      DATETIME,                      

    CONSTRAINT fk_ticket_entry_gate
        FOREIGN KEY (entry_gate_id) REFERENCES gates(id)
);

CREATE TABLE access_logs (
    id            CHAR(36)     PRIMARY KEY,
    event_time    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    gate_id       CHAR(36)     NOT NULL,
    direction     ENUM('ENTRY', 'EXIT') NOT NULL,

    -- What was presented at the gate
    access_method ENUM(
                    'RFID',
                    'TEMPORARY_TICKET',
                    'OPERATOR_OVERRIDE'
                  )            NOT NULL,
    card_uid      VARCHAR(64),         
    ticket_code   VARCHAR(64),          

  
    user_id       CHAR(36),
    session_id    CHAR(36),
    result        ENUM(
                    'GRANTED',
                    'DENIED',
                    'ERROR'
                  )            NOT NULL,
    deny_reason   VARCHAR(200),         

    CONSTRAINT fk_log_gate
        FOREIGN KEY (gate_id) REFERENCES gates(id),
        
	CONSTRAINT fk_log_user
        FOREIGN KEY (user_id) REFERENCES users(id),
        
	CONSTRAINT fk_log_session
        FOREIGN KEY (session_id) REFERENCES parking_sessions(id)
);



-- ============================================================
-- SAMPLE DATA 
-- ============================================================

-- ------------------------------------------------------------
-- users (6 members: 3 learners, 2 faculty, 1 staff)
-- ------------------------------------------------------------
INSERT INTO users (id, university_id, full_name, email, role, sub_role, faculty_unit, status, synced_at, created_at, updated_at) VALUES
  ('d4d02b14-6a6a-4270-aafc-d892b1de4ce4', '2352404', 'Pham Ngoc Huy', 'huy.pham@hcmut.edu.vn', 'LEARNER', 'UNDERGRADUATE', 'Faculty of Computer Science', 'ACTIVE', '2026-05-09 06:00:00', '2026-05-09 06:00:00', '2026-05-09 06:00:00');

INSERT INTO users (id, university_id, full_name, email, role, sub_role, faculty_unit, status, synced_at, created_at, updated_at) VALUES
  ('63c820d0-7290-4d67-b8a0-62de169d1b1a', '2352548', 'Be Nguyen Dang Khoa', 'khoa.be@hcmut.edu.vn', 'LEARNER', 'UNDERGRADUATE', 'Faculty of Computer Science', 'ACTIVE', '2026-05-09 06:00:00', '2026-05-09 06:00:00', '2026-05-09 06:00:00');

INSERT INTO users (id, university_id, full_name, email, role, sub_role, faculty_unit, status, synced_at, created_at, updated_at) VALUES
  ('8a7d612b-c81f-49df-904c-2a9837a62c2d', '2352379', 'Ho Quoc Huy', 'huy.ho@hcmut.edu.vn', 'LEARNER', 'GRADUATE', 'Faculty of Computer Science', 'ACTIVE', '2026-05-09 06:00:00', '2026-05-09 06:00:00', '2026-05-09 06:00:00');

INSERT INTO users (id, university_id, full_name, email, role, sub_role, faculty_unit, status, synced_at, created_at, updated_at) VALUES
  ('2b860262-d293-4d5b-bd10-5180afa717f0', 'FAC-001', 'Nguyen Van An', 'an.nguyen@hcmut.edu.vn', 'FACULTY', 'LECTURER', 'Faculty of Computer Science', 'ACTIVE', '2026-05-09 06:00:00', '2026-05-09 06:00:00', '2026-05-09 06:00:00');

INSERT INTO users (id, university_id, full_name, email, role, sub_role, faculty_unit, status, synced_at, created_at, updated_at) VALUES
  ('ab88d964-3efa-4a91-a482-b2a7c97bf98d', 'FAC-002', 'Tran Thi Bich', 'bich.tran@hcmut.edu.vn', 'FACULTY', 'PROFESSOR', 'Faculty of Electrical Engineering', 'ACTIVE', '2026-05-09 06:00:00', '2026-05-09 06:00:00', '2026-05-09 06:00:00');

INSERT INTO users (id, university_id, full_name, email, role, sub_role, faculty_unit, status, synced_at, created_at, updated_at) VALUES
  ('f4bcf71f-4702-472d-a56c-3a6eca3f4ab7', 'STF-001', 'Le Van Cuong', 'cuong.le@hcmut.edu.vn', 'STAFF', 'ADMIN_STAFF', 'University Administration', 'ACTIVE', '2026-05-09 06:00:00', '2026-05-09 06:00:00', '2026-05-09 06:00:00');

-- ------------------------------------------------------------
-- rfid_cards (one card per user)
-- ------------------------------------------------------------
INSERT INTO rfid_cards (id, card_uid, user_id, status, issued_at) VALUES
  ('61acb2b3-ea9f-4488-8cd7-beaecb338065', 'RFID-A1B2C3', 'd4d02b14-6a6a-4270-aafc-d892b1de4ce4', 'ACTIVE', '2026-01-15 08:00:00');

INSERT INTO rfid_cards (id, card_uid, user_id, status, issued_at) VALUES
  ('e700513c-1fee-40e6-b454-0bc7d50642aa', 'RFID-D4E5F6', '63c820d0-7290-4d67-b8a0-62de169d1b1a', 'ACTIVE', '2026-01-15 08:00:00');

INSERT INTO rfid_cards (id, card_uid, user_id, status, issued_at) VALUES
  ('371af3cb-ae3a-4793-906c-35486f3e70a2', 'RFID-G7H8I9', '8a7d612b-c81f-49df-904c-2a9837a62c2d', 'ACTIVE', '2026-01-15 08:00:00');

INSERT INTO rfid_cards (id, card_uid, user_id, status, issued_at) VALUES
  ('3f8bf9ea-14cd-4739-914f-30785e87865e', 'RFID-J1K2L3', '2b860262-d293-4d5b-bd10-5180afa717f0', 'ACTIVE', '2026-01-15 08:00:00');

INSERT INTO rfid_cards (id, card_uid, user_id, status, issued_at) VALUES
  ('467a26e0-c7d6-4bb9-abcc-be87107e9903', 'RFID-M4N5O6', 'ab88d964-3efa-4a91-a482-b2a7c97bf98d', 'ACTIVE', '2026-01-15 08:00:00');

INSERT INTO rfid_cards (id, card_uid, user_id, status, issued_at) VALUES
  ('2fb803e7-fbc0-4570-8ee1-0c4000a3b5b9', 'RFID-P7Q8R9', 'f4bcf71f-4702-472d-a56c-3a6eca3f4ab7', 'ACTIVE', '2026-01-15 08:00:00');

-- ------------------------------------------------------------
-- parking_zones (Zone A, Zone B)
-- ------------------------------------------------------------
INSERT INTO parking_zones (id, name, description, total_capacity, status, created_at) VALUES
  ('1725b6d9-89ae-4227-90d1-3ef4f1bfd60f', 'Zone A', 'Main building parking area', 4, 'OPEN', '2026-01-01 07:00:00');

INSERT INTO parking_zones (id, name, description, total_capacity, status, created_at) VALUES
  ('d3e43ac9-abc0-4207-a8d4-b6c0aa220526', 'Zone B', 'Library and lab parking area', 4, 'OPEN', '2026-01-01 07:00:00');

-- ------------------------------------------------------------
-- parking_slots (4 per zone)
-- ------------------------------------------------------------
INSERT INTO parking_slots (id, zone_id, slot_code, status, last_updated) VALUES
  ('ed9d430e-bb44-4ccf-811a-107c1626370e', '1725b6d9-89ae-4227-90d1-3ef4f1bfd60f', 'A-01', 'OCCUPIED', '2026-05-09 21:00:00');

INSERT INTO parking_slots (id, zone_id, slot_code, status, last_updated) VALUES
  ('4d7dc828-4d32-4030-9bb5-9bbd93fcf831', '1725b6d9-89ae-4227-90d1-3ef4f1bfd60f', 'A-02', 'OCCUPIED', '2026-05-09 21:00:00');

INSERT INTO parking_slots (id, zone_id, slot_code, status, last_updated) VALUES
  ('ecc295fc-4950-46be-9caf-000276fc5a17', '1725b6d9-89ae-4227-90d1-3ef4f1bfd60f', 'A-03', 'AVAILABLE', '2026-05-09 21:00:00');

INSERT INTO parking_slots (id, zone_id, slot_code, status, last_updated) VALUES
  ('fee82e14-3d3a-4bea-b3f0-b6a3405af8be', '1725b6d9-89ae-4227-90d1-3ef4f1bfd60f', 'A-04', 'AVAILABLE', '2026-05-09 21:00:00');

INSERT INTO parking_slots (id, zone_id, slot_code, status, last_updated) VALUES
  ('1d7b2f36-3c05-4217-aa4c-5b83265189f5', 'd3e43ac9-abc0-4207-a8d4-b6c0aa220526', 'B-01', 'OCCUPIED', '2026-05-09 21:00:00');

INSERT INTO parking_slots (id, zone_id, slot_code, status, last_updated) VALUES
  ('f2dbee8f-cad8-422c-a9ab-9d2b40783de9', 'd3e43ac9-abc0-4207-a8d4-b6c0aa220526', 'B-02', 'AVAILABLE', '2026-05-09 21:00:00');

INSERT INTO parking_slots (id, zone_id, slot_code, status, last_updated) VALUES
  ('77eb577a-7361-4e98-af13-45aa25a8eb30', 'd3e43ac9-abc0-4207-a8d4-b6c0aa220526', 'B-03', 'AVAILABLE', '2026-05-09 21:00:00');

INSERT INTO parking_slots (id, zone_id, slot_code, status, last_updated) VALUES
  ('92fd20f7-51b7-4d4f-8b2e-d228577933f1', 'd3e43ac9-abc0-4207-a8d4-b6c0aa220526', 'B-04', 'MAINTENANCE', '2026-05-09 21:00:00');

-- ------------------------------------------------------------
-- gates (entry + exit per zone)
-- ------------------------------------------------------------
INSERT INTO gates (id, zone_id, gate_code, direction, status, location, created_at) VALUES
  ('9b7f0c06-02b7-434f-8b12-56608e3a51d1', '1725b6d9-89ae-4227-90d1-3ef4f1bfd60f', 'GATE-A-IN', 'ENTRY', 'ONLINE', 'Zone A North Entrance', '2026-01-01 07:00:00');

INSERT INTO gates (id, zone_id, gate_code, direction, status, location, created_at) VALUES
  ('7a478009-674d-4a65-a2c6-ecb90b28da95', '1725b6d9-89ae-4227-90d1-3ef4f1bfd60f', 'GATE-A-OUT', 'EXIT', 'ONLINE', 'Zone A North Exit', '2026-01-01 07:00:00');

INSERT INTO gates (id, zone_id, gate_code, direction, status, location, created_at) VALUES
  ('f01430d2-1ff0-4347-84bf-3922dddbe935', 'd3e43ac9-abc0-4207-a8d4-b6c0aa220526', 'GATE-B-IN', 'ENTRY', 'ONLINE', 'Zone B East Entrance', '2026-01-01 07:00:00');

INSERT INTO gates (id, zone_id, gate_code, direction, status, location, created_at) VALUES
  ('b43dcde4-a7f7-4e35-852c-c96de748b865', 'd3e43ac9-abc0-4207-a8d4-b6c0aa220526', 'GATE-B-OUT', 'EXIT', 'ONLINE', 'Zone B East Exit', '2026-01-01 07:00:00');

-- ------------------------------------------------------------
-- parking_sessions (UC-01: 4 active RFID, 1 completed RFID)
-- ------------------------------------------------------------
INSERT INTO parking_sessions (id, user_id, ticket_id, entry_gate_id, entry_time, entry_method, exit_gate_id, exit_time, slot_id, status, user_role, card_uid, duration_minutes, fee_applicable, created_at, updated_at) VALUES
  ('ab0a9c4f-51ce-4851-97b7-fd10c9530385', 'd4d02b14-6a6a-4270-aafc-d892b1de4ce4', NULL, '9b7f0c06-02b7-434f-8b12-56608e3a51d1', '2026-05-09 08:15:00', 'RFID', NULL, NULL, 'ed9d430e-bb44-4ccf-811a-107c1626370e', 'ACTIVE', 'LEARNER', 'RFID-A1B2C3', NULL, TRUE, '2026-05-09 08:15:00', '2026-05-09 08:15:00');

INSERT INTO parking_sessions (id, user_id, ticket_id, entry_gate_id, entry_time, entry_method, exit_gate_id, exit_time, slot_id, status, user_role, card_uid, duration_minutes, fee_applicable, created_at, updated_at) VALUES
  ('9ec1ac74-60c0-422d-8014-2528c40ed261', '63c820d0-7290-4d67-b8a0-62de169d1b1a', NULL, '9b7f0c06-02b7-434f-8b12-56608e3a51d1', '2026-05-09 09:30:00', 'RFID', NULL, NULL, '4d7dc828-4d32-4030-9bb5-9bbd93fcf831', 'ACTIVE', 'LEARNER', 'RFID-D4E5F6', NULL, TRUE, '2026-05-09 09:30:00', '2026-05-09 09:30:00');

INSERT INTO parking_sessions (id, user_id, ticket_id, entry_gate_id, entry_time, entry_method, exit_gate_id, exit_time, slot_id, status, user_role, card_uid, duration_minutes, fee_applicable, created_at, updated_at) VALUES
  ('51818e9b-721b-41ad-bd4e-b4916a2d0494', '2b860262-d293-4d5b-bd10-5180afa717f0', NULL, '9b7f0c06-02b7-434f-8b12-56608e3a51d1', '2026-05-09 07:45:00', 'RFID', NULL, NULL, '1d7b2f36-3c05-4217-aa4c-5b83265189f5', 'ACTIVE', 'FACULTY', 'RFID-J1K2L3', NULL, FALSE, '2026-05-09 07:45:00', '2026-05-09 07:45:00');

INSERT INTO parking_sessions (id, user_id, ticket_id, entry_gate_id, entry_time, entry_method, exit_gate_id, exit_time, slot_id, status, user_role, card_uid, duration_minutes, fee_applicable, created_at, updated_at) VALUES
  ('dde51284-ad2a-4e5f-b90b-ad509002a781', 'f4bcf71f-4702-472d-a56c-3a6eca3f4ab7', NULL, '9b7f0c06-02b7-434f-8b12-56608e3a51d1', '2026-05-09 07:00:00', 'RFID', '7a478009-674d-4a65-a2c6-ecb90b28da95', '2026-05-09 11:30:00', 'ecc295fc-4950-46be-9caf-000276fc5a17', 'COMPLETED', 'STAFF', 'RFID-P7Q8R9', 270, TRUE, '2026-05-09 07:00:00', '2026-05-09 07:00:00');

-- ------------------------------------------------------------
-- temporary_tickets (UC-02: 1 kiosk-issued, 1 operator-issued)
-- ------------------------------------------------------------
INSERT INTO temporary_tickets (id, ticket_code, entry_gate_id, issued_by, operator_id, status, used_at, expires_at, issued_at) VALUES
  ('484af4d4-55df-4724-87e9-4bdb0eeace8a', 'TKT-20260509-001', 'f01430d2-1ff0-4347-84bf-3922dddbe935', 'KIOSK', NULL, 'ACTIVE', NULL, '2026-05-10 10:00:00', '2026-05-09 10:00:00');

INSERT INTO temporary_tickets (id, ticket_code, entry_gate_id, issued_by, operator_id, status, used_at, expires_at, issued_at) VALUES
  ('3a02f423-c83f-402b-b361-8cd5100ea7c1', 'TKT-20260509-002', '9b7f0c06-02b7-434f-8b12-56608e3a51d1', 'OPERATOR', 'f4bcf71f-4702-472d-a56c-3a6eca3f4ab7', 'USED', '2026-05-09 17:00:00', '2026-05-10 08:00:00', '2026-05-09 10:00:00');

-- ------------------------------------------------------------
-- parking_sessions (UC-02: 1 active visitor, 1 completed visitor)
-- ------------------------------------------------------------
INSERT INTO parking_sessions (id, user_id, ticket_id, entry_gate_id, entry_time, entry_method, exit_gate_id, exit_time, slot_id, status, user_role, card_uid, duration_minutes, fee_applicable, created_at, updated_at) VALUES
  ('93142c7e-01b8-4378-98f8-30941f629c00', NULL, '484af4d4-55df-4724-87e9-4bdb0eeace8a', 'f01430d2-1ff0-4347-84bf-3922dddbe935', '2026-05-09 10:05:00', 'TEMPORARY_TICKET', NULL, NULL, 'f2dbee8f-cad8-422c-a9ab-9d2b40783de9', 'ACTIVE', 'VISITOR', NULL, NULL, TRUE, '2026-05-09 10:05:00', '2026-05-09 10:05:00');

INSERT INTO parking_sessions (id, user_id, ticket_id, entry_gate_id, entry_time, entry_method, exit_gate_id, exit_time, slot_id, status, user_role, card_uid, duration_minutes, fee_applicable, created_at, updated_at) VALUES
  ('de1cda0b-9ed6-4e88-9661-87f3b74b6939', NULL, '3a02f423-c83f-402b-b361-8cd5100ea7c1', '9b7f0c06-02b7-434f-8b12-56608e3a51d1', '2026-05-09 14:00:00', 'TEMPORARY_TICKET', '7a478009-674d-4a65-a2c6-ecb90b28da95', '2026-05-09 17:00:00', '77eb577a-7361-4e98-af13-45aa25a8eb30', 'COMPLETED', 'VISITOR', NULL, 180, TRUE, '2026-05-09 14:00:00', '2026-05-09 14:00:00');

-- ------------------------------------------------------------
-- access_logs (10 events: granted, denied, temp)
-- ------------------------------------------------------------
INSERT INTO access_logs (id, event_time, gate_id, direction, access_method, card_uid, ticket_code, user_id, session_id, result, deny_reason) VALUES
  ('a32fea16-ccbe-478c-a48d-77edcef9e7ec', '2026-05-09 08:15:00', '9b7f0c06-02b7-434f-8b12-56608e3a51d1', 'ENTRY', 'RFID', 'RFID-A1B2C3', NULL, 'd4d02b14-6a6a-4270-aafc-d892b1de4ce4', 'ab0a9c4f-51ce-4851-97b7-fd10c9530385', 'GRANTED', NULL);

INSERT INTO access_logs (id, event_time, gate_id, direction, access_method, card_uid, ticket_code, user_id, session_id, result, deny_reason) VALUES
  ('e3a924f4-27a3-490c-a74a-39f762841962', '2026-05-09 09:30:00', '9b7f0c06-02b7-434f-8b12-56608e3a51d1', 'ENTRY', 'RFID', 'RFID-D4E5F6', NULL, '63c820d0-7290-4d67-b8a0-62de169d1b1a', '9ec1ac74-60c0-422d-8014-2528c40ed261', 'GRANTED', NULL);

INSERT INTO access_logs (id, event_time, gate_id, direction, access_method, card_uid, ticket_code, user_id, session_id, result, deny_reason) VALUES
  ('6ef4cf25-26b8-4a27-902c-fa581ec54db4', '2026-05-09 07:45:00', '9b7f0c06-02b7-434f-8b12-56608e3a51d1', 'ENTRY', 'RFID', 'RFID-J1K2L3', NULL, '2b860262-d293-4d5b-bd10-5180afa717f0', '51818e9b-721b-41ad-bd4e-b4916a2d0494', 'GRANTED', NULL);

INSERT INTO access_logs (id, event_time, gate_id, direction, access_method, card_uid, ticket_code, user_id, session_id, result, deny_reason) VALUES
  ('1e33742b-53c0-43cc-95be-a2a061780666', '2026-05-09 11:30:00', '7a478009-674d-4a65-a2c6-ecb90b28da95', 'EXIT', 'RFID', 'RFID-P7Q8R9', NULL, 'f4bcf71f-4702-472d-a56c-3a6eca3f4ab7', 'dde51284-ad2a-4e5f-b90b-ad509002a781', 'GRANTED', NULL);

INSERT INTO access_logs (id, event_time, gate_id, direction, access_method, card_uid, ticket_code, user_id, session_id, result, deny_reason) VALUES
  ('64a00e16-5150-4333-b173-eb2046fdf13a', '2026-05-09 10:00:00', '9b7f0c06-02b7-434f-8b12-56608e3a51d1', 'ENTRY', 'RFID', 'RFID-UNKNOWN', NULL, NULL, NULL, 'DENIED', 'Card not found in system');

INSERT INTO access_logs (id, event_time, gate_id, direction, access_method, card_uid, ticket_code, user_id, session_id, result, deny_reason) VALUES
  ('1bd5dedc-a334-492f-8e2a-82a55bef85df', '2026-05-09 10:15:00', '9b7f0c06-02b7-434f-8b12-56608e3a51d1', 'ENTRY', 'RFID', 'RFID-G7H8I9', NULL, '8a7d612b-c81f-49df-904c-2a9837a62c2d', NULL, 'DENIED', 'User account is inactive');

INSERT INTO access_logs (id, event_time, gate_id, direction, access_method, card_uid, ticket_code, user_id, session_id, result, deny_reason) VALUES
  ('b322d75e-8617-45fb-b05a-a25a7003fc66', '2026-05-09 10:05:00', 'f01430d2-1ff0-4347-84bf-3922dddbe935', 'ENTRY', 'TEMPORARY_TICKET', NULL, 'TKT-20260509-001', NULL, '93142c7e-01b8-4378-98f8-30941f629c00', 'GRANTED', NULL);

INSERT INTO access_logs (id, event_time, gate_id, direction, access_method, card_uid, ticket_code, user_id, session_id, result, deny_reason) VALUES
  ('3ed3a4ea-8513-4f13-a872-fa0562c5f0e8', '2026-05-09 14:00:00', '9b7f0c06-02b7-434f-8b12-56608e3a51d1', 'ENTRY', 'TEMPORARY_TICKET', NULL, 'TKT-20260509-002', NULL, 'de1cda0b-9ed6-4e88-9661-87f3b74b6939', 'GRANTED', NULL);

INSERT INTO access_logs (id, event_time, gate_id, direction, access_method, card_uid, ticket_code, user_id, session_id, result, deny_reason) VALUES
  ('2c07f866-b7ae-48d9-874a-dd14ab54008f', '2026-05-09 17:00:00', '7a478009-674d-4a65-a2c6-ecb90b28da95', 'EXIT', 'TEMPORARY_TICKET', NULL, 'TKT-20260509-002', NULL, 'de1cda0b-9ed6-4e88-9661-87f3b74b6939', 'GRANTED', NULL);

INSERT INTO access_logs (id, event_time, gate_id, direction, access_method, card_uid, ticket_code, user_id, session_id, result, deny_reason) VALUES
  ('121514f7-f38c-44e9-9d9f-c2767f40d73f', '2026-05-09 16:00:00', 'f01430d2-1ff0-4347-84bf-3922dddbe935', 'ENTRY', 'TEMPORARY_TICKET', NULL, NULL, NULL, NULL, 'ERROR', 'Session generation failure: DB timeout');



-- ============================================================
-- STORED PROCEDURES
-- ============================================================



-- ============================================================
-- sp_rfid_entry
-- UC-01: Authorized university member taps RFID card at entry gate
-- ============================================================
DELIMITER //
CREATE PROCEDURE sp_rfid_entry(
    IN  p_card_uid   VARCHAR(64),
    IN  p_gate_id    CHAR(36),
    OUT p_result     VARCHAR(20),   -- GRANTED | DENIED | ERROR
    OUT p_message    VARCHAR(200),
    OUT p_session_id CHAR(36)
)
sp_rfid_entry: BEGIN
    -- Local variables
    DECLARE v_card_status   VARCHAR(20);
    DECLARE v_user_id       CHAR(36);
    DECLARE v_user_status   VARCHAR(20);
    DECLARE v_user_role     VARCHAR(20);
    DECLARE v_sub_role      VARCHAR(50);
    DECLARE v_slot_id       CHAR(36);
    DECLARE v_zone_id       CHAR(36);
    DECLARE v_session_id    CHAR(36);
    DECLARE v_fee_applicable BOOLEAN;
    DECLARE v_gate_direction VARCHAR(10);
    DECLARE v_log_id        CHAR(36);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result     = 'ERROR';
        SET p_message    = 'Unexpected system error during entry processing';
        SET p_session_id = NULL;

        -- Log the error event
        SET v_log_id = UUID();
        INSERT INTO access_logs (
            id, event_time, gate_id, direction, access_method,
            card_uid, ticket_code, user_id, session_id, result, deny_reason
        ) VALUES (
            v_log_id, NOW(), p_gate_id, 'ENTRY', 'RFID',
            p_card_uid, NULL, NULL, NULL, 'ERROR',
            'System exception during entry processing'
        );
    END;

    -- ── Step 1: Validate gate direction ──
    SELECT direction INTO v_gate_direction
    FROM gates
    WHERE id = p_gate_id AND status = 'ONLINE';

    IF v_gate_direction IS NULL THEN
        SET p_result  = 'DENIED';
        SET p_message = 'Gate is offline or not found';
        SET p_session_id = NULL;

        INSERT INTO access_logs (
            id, event_time, gate_id, direction, access_method,
            card_uid, ticket_code, user_id, session_id, result, deny_reason
        ) VALUES (
            UUID(), NOW(), p_gate_id, 'ENTRY', 'RFID',
            p_card_uid, NULL, NULL, NULL, 'DENIED', p_message
        );
        LEAVE sp_rfid_entry;
    END IF;

    IF v_gate_direction = 'EXIT' THEN
        SET p_result  = 'DENIED';
        SET p_message = 'This gate is an exit-only gate';
        SET p_session_id = NULL;

        INSERT INTO access_logs (
            id, event_time, gate_id, direction, access_method,
            card_uid, ticket_code, user_id, session_id, result, deny_reason
        ) VALUES (
            UUID(), NOW(), p_gate_id, 'ENTRY', 'RFID',
            p_card_uid, NULL, NULL, NULL, 'DENIED', p_message
        );
        LEAVE sp_rfid_entry;
    END IF;

    -- ── Step 2: Look up RFID card ──
    SELECT rc.status, rc.user_id
    INTO v_card_status, v_user_id
    FROM rfid_cards rc
    WHERE rc.card_uid = p_card_uid
    LIMIT 1;

    IF v_user_id IS NULL THEN
        SET p_result  = 'DENIED';
        SET p_message = 'Card not found in system';
        SET p_session_id = NULL;

        INSERT INTO access_logs (
            id, event_time, gate_id, direction, access_method,
            card_uid, ticket_code, user_id, session_id, result, deny_reason
        ) VALUES (
            UUID(), NOW(), p_gate_id, 'ENTRY', 'RFID',
            p_card_uid, NULL, NULL, NULL, 'DENIED', p_message
        );
        LEAVE sp_rfid_entry;
    END IF;

    IF v_card_status != 'ACTIVE' THEN
        SET p_result  = 'DENIED';
        SET p_message = CONCAT('Card is ', v_card_status, '. Please contact administration.');
        SET p_session_id = NULL;

        INSERT INTO access_logs (
            id, event_time, gate_id, direction, access_method,
            card_uid, ticket_code, user_id, session_id, result, deny_reason
        ) VALUES (
            UUID(), NOW(), p_gate_id, 'ENTRY', 'RFID',
            p_card_uid, NULL, v_user_id, NULL, 'DENIED', p_message
        );
        LEAVE sp_rfid_entry;
    END IF;

    -- ── Step 3: Validate user status and retrieve role ──
    SELECT status, role, sub_role
    INTO v_user_status, v_user_role, v_sub_role
    FROM users
    WHERE id = v_user_id;

    IF v_user_status != 'ACTIVE' THEN
        SET p_result  = 'DENIED';
        SET p_message = CONCAT('User account is ', v_user_status, '. Access denied.');
        SET p_session_id = NULL;

        INSERT INTO access_logs (
            id, event_time, gate_id, direction, access_method,
            card_uid, ticket_code, user_id, session_id, result, deny_reason
        ) VALUES (
            UUID(), NOW(), p_gate_id, 'ENTRY', 'RFID',
            p_card_uid, NULL, v_user_id, NULL, 'DENIED', p_message
        );
        LEAVE sp_rfid_entry;
    END IF;

    -- ── Step 4: Determine fee_applicable based on role ──
    -- Faculty are fee-exempt; learners and staff are billed
    IF v_user_role = 'FACULTY' THEN
        SET v_fee_applicable = FALSE;
    ELSE
        SET v_fee_applicable = TRUE;
    END IF;

    -- ── Step 5: Find an available slot in the gate's zone ──
    SELECT g.zone_id INTO v_zone_id
    FROM gates g
    WHERE g.id = p_gate_id;

    SELECT id INTO v_slot_id
    FROM parking_slots
    WHERE zone_id = v_zone_id
      AND status  = 'AVAILABLE'
    ORDER BY slot_code ASC
    LIMIT 1
    FOR UPDATE;                    -- lock the row to prevent race conditions

    IF v_slot_id IS NULL THEN
        SET p_result  = 'DENIED';
        SET p_message = 'No available slots in this zone';
        SET p_session_id = NULL;

        INSERT INTO access_logs (
            id, event_time, gate_id, direction, access_method,
            card_uid, ticket_code, user_id, session_id, result, deny_reason
        ) VALUES (
            UUID(), NOW(), p_gate_id, 'ENTRY', 'RFID',
            p_card_uid, NULL, v_user_id, NULL, 'DENIED', p_message
        );
        LEAVE sp_rfid_entry;
    END IF;

    -- ── Step 6: Begin transaction — create session + update slot ──
    START TRANSACTION;

        SET v_session_id = UUID();

        INSERT INTO parking_sessions (
            id, user_id, ticket_id,
            entry_gate_id, entry_time, entry_method,
            exit_gate_id, exit_time,
            slot_id, status,
            user_role, card_uid,
            duration_minutes, fee_applicable,
            created_at, updated_at
        ) VALUES (
            v_session_id, v_user_id, NULL,
            p_gate_id, NOW(), 'RFID',
            NULL, NULL,
            v_slot_id, 'ACTIVE',
            v_user_role, p_card_uid,
            NULL, v_fee_applicable,
            NOW(), NOW()
        );

        UPDATE parking_slots
        SET status       = 'OCCUPIED',
            last_updated = NOW()
        WHERE id = v_slot_id;

        -- ── Step 7: Write audit log ──
        INSERT INTO access_logs (
            id, event_time, gate_id, direction, access_method,
            card_uid, ticket_code, user_id, session_id, result, deny_reason
        ) VALUES (
            UUID(), NOW(), p_gate_id, 'ENTRY', 'RFID',
            p_card_uid, NULL, v_user_id, v_session_id, 'GRANTED', NULL
        );

    COMMIT;

    SET p_result     = 'GRANTED';
    SET p_message    = CONCAT('Access granted. Slot assigned: ',
                              (SELECT slot_code FROM parking_slots WHERE id = v_slot_id));
    SET p_session_id = v_session_id;

END sp_rfid_entry//
DELIMITER ;

-- ============================================================
-- sp_rfid_exit
-- UC-01: Authorized university member taps RFID card at exit gate
-- ============================================================
DELIMITER //
CREATE PROCEDURE sp_rfid_exit(
    IN  p_card_uid   VARCHAR(64),
    IN  p_gate_id    CHAR(36),
    OUT p_result     VARCHAR(20),
    OUT p_message    VARCHAR(200),
    OUT p_duration   INT,
    OUT p_fee        BOOLEAN
)
sp_rfid_exit: BEGIN
    DECLARE v_user_id       CHAR(36);
    DECLARE v_user_status   VARCHAR(20);
    DECLARE v_card_status   VARCHAR(20);
    DECLARE v_session_id    CHAR(36);
    DECLARE v_slot_id       CHAR(36);
    DECLARE v_entry_time    DATETIME;
    DECLARE v_fee_applicable BOOLEAN;
    DECLARE v_duration      INT;
    DECLARE v_gate_direction VARCHAR(10);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result   = 'ERROR';
        SET p_message  = 'Unexpected system error during exit processing';
        SET p_duration = NULL;
        SET p_fee      = NULL;

        INSERT INTO access_logs (
            id, event_time, gate_id, direction, access_method,
            card_uid, ticket_code, user_id, session_id, result, deny_reason
        ) VALUES (
            UUID(), NOW(), p_gate_id, 'EXIT', 'RFID',
            p_card_uid, NULL, NULL, NULL, 'ERROR',
            'System exception during exit processing'
        );
    END;

    -- ── Step 1: Validate gate ──
    SELECT direction INTO v_gate_direction
    FROM gates
    WHERE id = p_gate_id AND status = 'ONLINE';

    IF v_gate_direction IS NULL OR v_gate_direction = 'ENTRY' THEN
        SET p_result  = 'DENIED';
        SET p_message = 'Gate is not a valid exit gate';
        SET p_duration = NULL; SET p_fee = NULL;

        INSERT INTO access_logs (
            id, event_time, gate_id, direction, access_method,
            card_uid, ticket_code, user_id, session_id, result, deny_reason
        ) VALUES (
            UUID(), NOW(), p_gate_id, 'EXIT', 'RFID',
            p_card_uid, NULL, NULL, NULL, 'DENIED', p_message
        );
        LEAVE sp_rfid_exit;
    END IF;

    -- ── Step 2: Look up card and user ──
    SELECT rc.status, rc.user_id
    INTO v_card_status, v_user_id
    FROM rfid_cards rc
    WHERE rc.card_uid = p_card_uid
    LIMIT 1;

    IF v_user_id IS NULL OR v_card_status != 'ACTIVE' THEN
        SET p_result  = 'DENIED';
        SET p_message = 'Card not recognized or revoked';
        SET p_duration = NULL; SET p_fee = NULL;

        INSERT INTO access_logs (
            id, event_time, gate_id, direction, access_method,
            card_uid, ticket_code, user_id, session_id, result, deny_reason
        ) VALUES (
            UUID(), NOW(), p_gate_id, 'EXIT', 'RFID',
            p_card_uid, NULL, v_user_id, NULL, 'DENIED', p_message
        );
        LEAVE sp_rfid_exit;
    END IF;

    -- ── Step 3: Find the active session ──
    SELECT id, slot_id, entry_time, fee_applicable
    INTO v_session_id, v_slot_id, v_entry_time, v_fee_applicable
    FROM parking_sessions
    WHERE user_id = v_user_id
      AND status  = 'ACTIVE'
      AND entry_method = 'RFID'
    ORDER BY entry_time DESC
    LIMIT 1;

    IF v_session_id IS NULL THEN
        SET p_result  = 'DENIED';
        SET p_message = 'No active parking session found for this card';
        SET p_duration = NULL; SET p_fee = NULL;

        INSERT INTO access_logs (
            id, event_time, gate_id, direction, access_method,
            card_uid, ticket_code, user_id, session_id, result, deny_reason
        ) VALUES (
            UUID(), NOW(), p_gate_id, 'EXIT', 'RFID',
            p_card_uid, NULL, v_user_id, NULL, 'DENIED', p_message
        );
        LEAVE sp_rfid_exit;
    END IF;

    -- ── Step 4: Calculate duration ──
    SET v_duration = TIMESTAMPDIFF(MINUTE, v_entry_time, NOW());

    -- ── Step 5: Transaction — close session + free slot ──
    START TRANSACTION;

        UPDATE parking_sessions
        SET exit_gate_id     = p_gate_id,
            exit_time        = NOW(),
            duration_minutes = v_duration,
            status           = 'COMPLETED',
            updated_at       = NOW()
        WHERE id = v_session_id;

        UPDATE parking_slots
        SET status       = 'AVAILABLE',
            last_updated = NOW()
        WHERE id = v_slot_id;

        -- ── Step 6: Write audit log ──
        INSERT INTO access_logs (
            id, event_time, gate_id, direction, access_method,
            card_uid, ticket_code, user_id, session_id, result, deny_reason
        ) VALUES (
            UUID(), NOW(), p_gate_id, 'EXIT', 'RFID',
            p_card_uid, NULL, v_user_id, v_session_id, 'GRANTED', NULL
        );

    COMMIT;

    SET p_result   = 'GRANTED';
    SET p_message  = CONCAT('Exit processed. Duration: ', v_duration, ' minutes.');
    SET p_duration = v_duration;
    SET p_fee      = v_fee_applicable;

END sp_rfid_exit // 
DELIMITER ;

-- ============================================================
-- sp_issue_temp_ticket
-- UC-02: Issue temporary ticket to visitor or cardless user
-- ============================================================
DELIMITER //
CREATE PROCEDURE sp_issue_temp_ticket(
    IN  p_gate_id     CHAR(36),
    IN  p_issued_by   ENUM('KIOSK','OPERATOR'),
    IN  p_operator_id CHAR(36),          -- NULL if issued_by = KIOSK
    OUT p_result      VARCHAR(20),
    OUT p_message     VARCHAR(200),
    OUT p_ticket_code VARCHAR(64),
    OUT p_session_id  CHAR(36)
)
sp_issue_temp_ticket: BEGIN
    DECLARE v_ticket_id    CHAR(36);
    DECLARE v_session_id   CHAR(36);
    DECLARE v_ticket_code  VARCHAR(64);
    DECLARE v_slot_id      CHAR(36);
    DECLARE v_zone_id      CHAR(36);
    DECLARE v_gate_status  VARCHAR(20);
    DECLARE v_gate_direction VARCHAR(10);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result      = 'ERROR';
        SET p_message     = 'System error: ticket generation failed';
        SET p_ticket_code = NULL;
        SET p_session_id  = NULL;

        -- Void the ticket if it was partially created
        IF v_ticket_id IS NOT NULL THEN
            UPDATE temporary_tickets
            SET status = 'VOID'
            WHERE id = v_ticket_id;
        END IF;

        INSERT INTO access_logs (
            id, event_time, gate_id, direction, access_method,
            card_uid, ticket_code, user_id, session_id, result, deny_reason
        ) VALUES (
            UUID(), NOW(), p_gate_id, 'ENTRY', 'TEMPORARY_TICKET',
            NULL, NULL, NULL, NULL, 'ERROR',
            'Session generation failure: system exception'
        );
    END;

    -- ── Step 1: Validate gate ──
    SELECT status, direction INTO v_gate_status, v_gate_direction
    FROM gates
    WHERE id = p_gate_id;

    IF v_gate_status IS NULL THEN
        SET p_result = 'ERROR'; SET p_message = 'Gate not found';
        SET p_ticket_code = NULL; SET p_session_id = NULL;
        LEAVE sp_issue_temp_ticket;
    END IF;

    IF v_gate_status != 'ONLINE' THEN
        SET p_result = 'ERROR'; SET p_message = 'Gate is offline or faulty';
        SET p_ticket_code = NULL; SET p_session_id = NULL;
        LEAVE sp_issue_temp_ticket;
    END IF;

    IF v_gate_direction = 'EXIT' THEN
        SET p_result = 'DENIED'; SET p_message = 'This gate is an exit-only gate';
        SET p_ticket_code = NULL; SET p_session_id = NULL;
        LEAVE sp_issue_temp_ticket;
    END IF;

    -- ── Step 2: Find available slot in the gate's zone ──
    SELECT zone_id INTO v_zone_id
    FROM gates WHERE id = p_gate_id;

    SELECT id INTO v_slot_id
    FROM parking_slots
    WHERE zone_id = v_zone_id
      AND status  = 'AVAILABLE'
    ORDER BY slot_code ASC
    LIMIT 1
    FOR UPDATE;

    IF v_slot_id IS NULL THEN
        SET p_result      = 'DENIED';
        SET p_message     = 'No available slots. Cannot issue ticket.';
        SET p_ticket_code = NULL;
        SET p_session_id  = NULL;

        INSERT INTO access_logs (
            id, event_time, gate_id, direction, access_method,
            card_uid, ticket_code, user_id, session_id, result, deny_reason
        ) VALUES (
            UUID(), NOW(), p_gate_id, 'ENTRY', 'TEMPORARY_TICKET',
            NULL, NULL, NULL, NULL, 'DENIED', p_message
        );
        LEAVE sp_issue_temp_ticket;
    END IF;

    -- ── Step 3: Generate unique ticket code ──
    -- Format: TKT-YYYYMMDD-XXXXXX (date + 6 random hex chars)
    SET v_ticket_code = CONCAT(
        'TKT-',
        DATE_FORMAT(NOW(), '%Y%m%d'),
        '-',
        UPPER(SUBSTRING(MD5(UUID()), 1, 6))
    );

    -- ── Step 4: Transaction — create ticket + session + update slot ──
    START TRANSACTION;

        SET v_ticket_id  = UUID();
        SET v_session_id = UUID();

        -- Insert ticket
        INSERT INTO temporary_tickets (
            id, ticket_code, entry_gate_id,
            issued_by, operator_id,
            status, issued_at,
            expires_at
        ) VALUES (
            v_ticket_id, v_ticket_code, p_gate_id,
            p_issued_by, p_operator_id,
            'ACTIVE', NOW(),
            DATE_ADD(NOW(), INTERVAL 24 HOUR)
        );

        -- Insert visitor session
        INSERT INTO parking_sessions (
            id, user_id, ticket_id,
            entry_gate_id, entry_time, entry_method,
            exit_gate_id, exit_time,
            slot_id, status,
            user_role, card_uid,
            duration_minutes, fee_applicable,
            created_at, updated_at
        ) VALUES (
            v_session_id, NULL, v_ticket_id,
            p_gate_id, NOW(), 'TEMPORARY_TICKET',
            NULL, NULL,
            v_slot_id, 'ACTIVE',
            'VISITOR', NULL,
            NULL, TRUE,
            NOW(), NOW()
        );

        -- Mark slot as occupied
        UPDATE parking_slots
        SET status       = 'OCCUPIED',
            last_updated = NOW()
        WHERE id = v_slot_id;

        -- Write audit log
        INSERT INTO access_logs (
            id, event_time, gate_id, direction, access_method,
            card_uid, ticket_code, user_id, session_id, result, deny_reason
        ) VALUES (
            UUID(), NOW(), p_gate_id, 'ENTRY', 'TEMPORARY_TICKET',
            NULL, v_ticket_code, NULL, v_session_id, 'GRANTED', NULL
        );

    COMMIT;

    SET p_result      = 'GRANTED';
    SET p_message     = CONCAT('Ticket issued. Please keep your ticket for exit. Code: ', v_ticket_code);
    SET p_ticket_code = v_ticket_code;
    SET p_session_id  = v_session_id;

END sp_issue_temp_ticket //
DELIMITER ;

-- ============================================================
-- sp_temp_ticket_exit
-- UC-02: Process exit for visitor using temporary ticket
-- ============================================================
DELIMITER //
CREATE PROCEDURE sp_temp_ticket_exit(
    IN  p_ticket_code VARCHAR(64),
    IN  p_gate_id     CHAR(36),
    OUT p_result      VARCHAR(20),
    OUT p_message     VARCHAR(200),
    OUT p_duration    INT
)
sp_temp_ticket_exit: BEGIN
    DECLARE v_ticket_id    CHAR(36);
    DECLARE v_ticket_status VARCHAR(20);
    DECLARE v_session_id   CHAR(36);
    DECLARE v_slot_id      CHAR(36);
    DECLARE v_entry_time   DATETIME;
    DECLARE v_duration     INT;
    DECLARE v_expires_at   DATETIME;
    DECLARE v_gate_direction VARCHAR(10);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result   = 'ERROR';
        SET p_message  = 'System error during ticket exit processing';
        SET p_duration = NULL;

        INSERT INTO access_logs (
            id, event_time, gate_id, direction, access_method,
            card_uid, ticket_code, user_id, session_id, result, deny_reason
        ) VALUES (
            UUID(), NOW(), p_gate_id, 'EXIT', 'TEMPORARY_TICKET',
            NULL, p_ticket_code, NULL, NULL, 'ERROR',
            'System exception during exit processing'
        );
    END;

    -- ── Step 1: Validate exit gate ──
    SELECT direction INTO v_gate_direction
    FROM gates
    WHERE id = p_gate_id AND status = 'ONLINE';

    IF v_gate_direction IS NULL OR v_gate_direction = 'ENTRY' THEN
        SET p_result  = 'DENIED';
        SET p_message = 'Gate is not a valid exit gate';
        SET p_duration = NULL;

        INSERT INTO access_logs (
            id, event_time, gate_id, direction, access_method,
            card_uid, ticket_code, user_id, session_id, result, deny_reason
        ) VALUES (
            UUID(), NOW(), p_gate_id, 'EXIT', 'TEMPORARY_TICKET',
            NULL, p_ticket_code, NULL, NULL, 'DENIED', p_message
        );
        LEAVE sp_temp_ticket_exit;
    END IF;

    -- ── Step 2: Look up the ticket ──
    SELECT id, status, expires_at
    INTO v_ticket_id, v_ticket_status, v_expires_at
    FROM temporary_tickets
    WHERE ticket_code = p_ticket_code
    LIMIT 1;

    IF v_ticket_id IS NULL THEN
        SET p_result  = 'DENIED';
        SET p_message = 'Ticket not found. Please contact the operator.';
        SET p_duration = NULL;

        INSERT INTO access_logs (
            id, event_time, gate_id, direction, access_method,
            card_uid, ticket_code, user_id, session_id, result, deny_reason
        ) VALUES (
            UUID(), NOW(), p_gate_id, 'EXIT', 'TEMPORARY_TICKET',
            NULL, p_ticket_code, NULL, NULL, 'DENIED', p_message
        );
        LEAVE sp_temp_ticket_exit;
    END IF;

    IF v_ticket_status != 'ACTIVE' THEN
        SET p_result  = 'DENIED';
        SET p_message = CONCAT('Ticket is already ', v_ticket_status, '.');
        SET p_duration = NULL;

        INSERT INTO access_logs (
            id, event_time, gate_id, direction, access_method,
            card_uid, ticket_code, user_id, session_id, result, deny_reason
        ) VALUES (
            UUID(), NOW(), p_gate_id, 'EXIT', 'TEMPORARY_TICKET',
            NULL, p_ticket_code, NULL, NULL, 'DENIED', p_message
        );
        LEAVE sp_temp_ticket_exit;
    END IF;

    -- ── Step 3: Check expiry ──
    IF NOW() > v_expires_at THEN
        SET p_result  = 'DENIED';
        SET p_message = 'Ticket has expired. Please contact the operator.';
        SET p_duration = NULL;

        INSERT INTO access_logs (
            id, event_time, gate_id, direction, access_method,
            card_uid, ticket_code, user_id, session_id, result, deny_reason
        ) VALUES (
            UUID(), NOW(), p_gate_id, 'EXIT', 'TEMPORARY_TICKET',
            NULL, p_ticket_code, NULL, NULL, 'DENIED', p_message
        );
        LEAVE sp_temp_ticket_exit;
    END IF;

    -- ── Step 4: Find the linked active session ──
    SELECT id, slot_id, entry_time
    INTO v_session_id, v_slot_id, v_entry_time
    FROM parking_sessions
    WHERE ticket_id = v_ticket_id
      AND status    = 'ACTIVE'
    LIMIT 1;

    IF v_session_id IS NULL THEN
        SET p_result  = 'ERROR';
        SET p_message = 'No active session found for this ticket.';
        SET p_duration = NULL;

        INSERT INTO access_logs (
            id, event_time, gate_id, direction, access_method,
            card_uid, ticket_code, user_id, session_id, result, deny_reason
        ) VALUES (
            UUID(), NOW(), p_gate_id, 'EXIT', 'TEMPORARY_TICKET',
            NULL, p_ticket_code, NULL, NULL, 'ERROR', p_message
        );
        LEAVE sp_temp_ticket_exit;
    END IF;

    -- ── Step 5: Calculate duration ──
    SET v_duration = TIMESTAMPDIFF(MINUTE, v_entry_time, NOW());

    -- ── Step 6: Transaction — close session + mark ticket used + free slot ──
    START TRANSACTION;

        UPDATE parking_sessions
        SET exit_gate_id     = p_gate_id,
            exit_time        = NOW(),
            duration_minutes = v_duration,
            status           = 'COMPLETED',
            updated_at       = NOW()
        WHERE id = v_session_id;

        UPDATE temporary_tickets
        SET status  = 'USED',
            used_at = NOW()
        WHERE id = v_ticket_id;

        UPDATE parking_slots
        SET status       = 'AVAILABLE',
            last_updated = NOW()
        WHERE id = v_slot_id;

        -- Write audit log
        INSERT INTO access_logs (
            id, event_time, gate_id, direction, access_method,
            card_uid, ticket_code, user_id, session_id, result, deny_reason
        ) VALUES (
            UUID(), NOW(), p_gate_id, 'EXIT', 'TEMPORARY_TICKET',
            NULL, p_ticket_code, NULL, v_session_id, 'GRANTED', NULL
        );

    COMMIT;

    SET p_result   = 'GRANTED';
    SET p_message  = CONCAT('Exit processed. Duration: ', v_duration, ' minutes. Thank you.');
    SET p_duration = v_duration;

END sp_temp_ticket_exit //
DELIMITER ;




