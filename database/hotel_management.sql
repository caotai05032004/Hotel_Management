-- =====================================================================
-- PhucNguyen Resort & Tour Hub  (SWP391-HOS-02)
-- Lược đồ CSDL MySQL 8.0.16+
--
-- Quy ước:
--   - Tên bảng: tiếng Việt không dấu, snake_case. Tên cột: tiếng Anh.
--   - Khóa chính / khóa ngoại: CHAR(36) UUID, sinh bằng DEFAULT (UUID()).
--   - Tiền tệ: DECIMAL(15,2) VND.
--   - Engine InnoDB, charset utf8mb4.
--
-- Yêu cầu phiên bản: MySQL >= 8.0.16 (DEFAULT (UUID()) cần 8.0.13,
-- CHECK constraint được thực thi từ 8.0.16).
-- =====================================================================

DROP DATABASE IF EXISTS hotel_management;
CREATE DATABASE hotel_management
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;
USE hotel_management;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 1;


-- =====================================================================
-- MODULE 1 — TÀI KHOẢN, HỒ SƠ, DỮ LIỆU NỀN
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tài khoản đăng nhập. Không chứa dữ liệu cá nhân nhạy cảm
-- (CCCD/passport) — phần đó tách sang ho_so_khach để phục vụ
-- Luật BVDLCN 91/2025/QH15 và NĐ 356/2025/NĐ-CP.
-- ---------------------------------------------------------------------
CREATE TABLE nguoi_dung (
                            id                  CHAR(36)     NOT NULL DEFAULT (UUID()),
                            email               VARCHAR(190) NOT NULL,
                            password_hash       VARCHAR(255) NOT NULL,
                            full_name           VARCHAR(150) NOT NULL,
                            phone               VARCHAR(20)      NULL,
                            status              ENUM('PENDING_VERIFICATION','ACTIVE','LOCKED','ANONYMIZED')
                                NOT NULL DEFAULT 'PENDING_VERIFICATION',
                            email_verified_at   DATETIME         NULL,
                            verification_token  VARCHAR(100)     NULL,
                            last_login_at       DATETIME         NULL,
                            anonymized_at       DATETIME         NULL,   -- UC05: quyền xóa dữ liệu
                            created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,
                            CONSTRAINT pk_nguoi_dung PRIMARY KEY (id),
                            CONSTRAINT uq_nguoi_dung_email UNIQUE (email)
) ENGINE = InnoDB;

CREATE TABLE vai_tro (
                         id          CHAR(36)    NOT NULL DEFAULT (UUID()),
                         code        VARCHAR(30) NOT NULL,   -- GUEST, RECEPTIONIST, FNB_STAFF, TOUR_GUIDE, MANAGER, ADMIN
                         name        VARCHAR(80) NOT NULL,
                         description VARCHAR(255)    NULL,
                         CONSTRAINT pk_vai_tro PRIMARY KEY (id),
                         CONSTRAINT uq_vai_tro_code UNIQUE (code)
) ENGINE = InnoDB;

CREATE TABLE nguoi_dung_vai_tro (
                                    nguoi_dung_id CHAR(36) NOT NULL,
                                    vai_tro_id    CHAR(36) NOT NULL,
                                    assigned_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                    CONSTRAINT pk_nguoi_dung_vai_tro PRIMARY KEY (nguoi_dung_id, vai_tro_id),
                                    CONSTRAINT fk_ndvt_nguoi_dung FOREIGN KEY (nguoi_dung_id)
                                        REFERENCES nguoi_dung (id) ON DELETE CASCADE,
                                    CONSTRAINT fk_ndvt_vai_tro FOREIGN KEY (vai_tro_id)
                                        REFERENCES vai_tro (id) ON DELETE RESTRICT
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Dữ liệu cá nhân nhạy cảm — bảng tách riêng, cột giấy tờ lưu ở dạng
-- mã hóa (AES phía ứng dụng, lưu base64). id_number_hash dùng cho
-- tra cứu chính xác mà không cần giải mã.
-- Ẩn danh hóa = xóa nội dung bảng này, giữ nguyên bản ghi tài chính.
-- ---------------------------------------------------------------------
CREATE TABLE ho_so_khach (
                             id                    CHAR(36)     NOT NULL DEFAULT (UUID()),
                             nguoi_dung_id         CHAR(36)     NOT NULL,
                             id_type               ENUM('CCCD','PASSPORT','OTHER') NOT NULL DEFAULT 'CCCD',
                             id_number_encrypted   VARBINARY(512)   NULL,
                             id_number_hash        CHAR(64)         NULL,   -- SHA-256, phục vụ tìm kiếm
                             id_issued_date        DATE             NULL,
                             id_issued_place       VARCHAR(150)     NULL,
                             date_of_birth         DATE             NULL,
                             gender                ENUM('MALE','FEMALE','OTHER') NULL,
                             nationality           VARCHAR(80)      NULL,
                             permanent_address     VARCHAR(255)     NULL,
                             id_document_image_url VARCHAR(500)     NULL,
                             created_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             updated_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP,
                             CONSTRAINT pk_ho_so_khach PRIMARY KEY (id),
                             CONSTRAINT uq_ho_so_khach_nguoi_dung UNIQUE (nguoi_dung_id),
                             CONSTRAINT fk_hsk_nguoi_dung FOREIGN KEY (nguoi_dung_id)
                                 REFERENCES nguoi_dung (id) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE INDEX ix_ho_so_khach_id_hash ON ho_so_khach (id_number_hash);

-- ---------------------------------------------------------------------
-- Nhật ký đồng ý xử lý dữ liệu — append-only, chứng minh "sự đồng ý
-- tường minh" theo Luật BVDLCN. Thu hồi bằng cách ghi revoked_at.
-- ---------------------------------------------------------------------
CREATE TABLE dong_y_du_lieu (
                                id             CHAR(36)     NOT NULL DEFAULT (UUID()),
                                nguoi_dung_id  CHAR(36)     NOT NULL,
                                consent_type   ENUM('IDENTITY_DOCUMENT','MARKETING','PAYMENT_STORAGE','POLICE_REPORTING')
                                                            NOT NULL,
                                policy_version VARCHAR(20)  NOT NULL,
                                granted        TINYINT(1)   NOT NULL DEFAULT 1,
                                granted_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                revoked_at     DATETIME         NULL,
                                ip_address     VARCHAR(45)      NULL,
                                CONSTRAINT pk_dong_y_du_lieu PRIMARY KEY (id),
                                CONSTRAINT fk_dydl_nguoi_dung FOREIGN KEY (nguoi_dung_id)
                                    REFERENCES nguoi_dung (id) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE INDEX ix_dong_y_nguoi_dung ON dong_y_du_lieu (nguoi_dung_id, consent_type);

-- ---------------------------------------------------------------------
-- Yêu cầu thực hiện quyền của chủ thể dữ liệu (UC05)
-- ---------------------------------------------------------------------
CREATE TABLE yeu_cau_du_lieu (
                                 id             CHAR(36)  NOT NULL DEFAULT (UUID()),
                                 nguoi_dung_id  CHAR(36)  NOT NULL,
                                 request_type   ENUM('ERASURE','ACCESS','RECTIFICATION') NOT NULL,
                                 status         ENUM('RECEIVED','PROCESSING','COMPLETED','REJECTED')
                                     NOT NULL DEFAULT 'RECEIVED',
                                 reason         VARCHAR(500)  NULL,
                                 requested_at   DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 processed_at   DATETIME      NULL,
                                 processed_by   CHAR(36)      NULL,
                                 CONSTRAINT pk_yeu_cau_du_lieu PRIMARY KEY (id),
                                 CONSTRAINT fk_ycdl_nguoi_dung FOREIGN KEY (nguoi_dung_id)
                                     REFERENCES nguoi_dung (id) ON DELETE CASCADE,
                                 CONSTRAINT fk_ycdl_processed_by FOREIGN KEY (processed_by)
                                     REFERENCES nguoi_dung (id) ON DELETE SET NULL
) ENGINE = InnoDB;


-- =====================================================================
-- MODULE 2 — HẠNG PHÒNG, PHÒNG VẬT LÝ, TỒN KHO, ĐẶT PHÒNG
-- =====================================================================

CREATE TABLE hang_phong (
                            id             CHAR(36)      NOT NULL DEFAULT (UUID()),
                            code           VARCHAR(20)   NOT NULL,   -- DLX, STE, VIL...
                            name           VARCHAR(120)  NOT NULL,
                            description    TEXT              NULL,
                            base_price     DECIMAL(15,2) NOT NULL,
                            max_adults     TINYINT       NOT NULL DEFAULT 2,
                            max_children   TINYINT       NOT NULL DEFAULT 1,
                            bed_type       VARCHAR(60)       NULL,
                            area_sqm       DECIMAL(6,2)      NULL,
                            amenities      JSON              NULL,   -- TCVN 4391:2015: tiện nghi theo hạng sao
                            is_active      TINYINT(1)    NOT NULL DEFAULT 1,
                            created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,
                            CONSTRAINT pk_hang_phong PRIMARY KEY (id),
                            CONSTRAINT uq_hang_phong_code UNIQUE (code),
                            CONSTRAINT ck_hang_phong_price CHECK (base_price >= 0)
) ENGINE = InnoDB;

CREATE TABLE anh_hang_phong (
                                id            CHAR(36)     NOT NULL DEFAULT (UUID()),
                                hang_phong_id CHAR(36)     NOT NULL,
                                image_url     VARCHAR(500) NOT NULL,
                                caption       VARCHAR(200)     NULL,
                                sort_order    SMALLINT     NOT NULL DEFAULT 0,
                                CONSTRAINT pk_anh_hang_phong PRIMARY KEY (id),
                                CONSTRAINT fk_ahp_hang_phong FOREIGN KEY (hang_phong_id)
                                    REFERENCES hang_phong (id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Phòng vật lý. Trạng thái tách thành 3 trục độc lập thay vì một enum
-- gộp: chiếm dụng / vệ sinh / khả dụng kỹ thuật (OOO, OOS).
-- Vòng đời AHLEI: VACANT+CLEAN -> OCCUPIED+CLEAN -> OCCUPIED+DIRTY
--                 -> VACANT+DIRTY -> (housekeeping) -> VACANT+CLEAN
-- ---------------------------------------------------------------------
CREATE TABLE phong (
                       id                  CHAR(36)    NOT NULL DEFAULT (UUID()),
                       hang_phong_id       CHAR(36)    NOT NULL,
                       room_number         VARCHAR(10) NOT NULL,
                       floor_no            TINYINT     NOT NULL,
                       occupancy_status    ENUM('VACANT','OCCUPIED')               NOT NULL DEFAULT 'VACANT',
                       housekeeping_status ENUM('CLEAN','DIRTY','INSPECTED')       NOT NULL DEFAULT 'CLEAN',
                       service_status      ENUM('IN_SERVICE','OUT_OF_ORDER','OUT_OF_SERVICE')
                           NOT NULL DEFAULT 'IN_SERVICE',
                       note                VARCHAR(255)    NULL,
                       updated_at          DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,
                       CONSTRAINT pk_phong PRIMARY KEY (id),
                       CONSTRAINT uq_phong_number UNIQUE (room_number),
                       CONSTRAINT fk_phong_hang_phong FOREIGN KEY (hang_phong_id)
                           REFERENCES hang_phong (id) ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE INDEX ix_phong_hang_trang_thai
    ON phong (hang_phong_id, occupancy_status, housekeeping_status);

-- ---------------------------------------------------------------------
-- Giá phòng theo từng ngày (rate plan tối giản). Đặc tả gốc không nêu,
-- nhưng UC24 (báo cáo doanh thu) và night audit cần giá theo đêm.
-- Không có dòng cho ngày nào thì lấy hang_phong.base_price.
-- ---------------------------------------------------------------------
CREATE TABLE gia_phong_theo_ngay (
                                     hang_phong_id CHAR(36)      NOT NULL,
                                     rate_date     DATE          NOT NULL,
                                     price         DECIMAL(15,2) NOT NULL,
                                     CONSTRAINT pk_gia_phong_theo_ngay PRIMARY KEY (hang_phong_id, rate_date),
                                     CONSTRAINT fk_gptn_hang_phong FOREIGN KEY (hang_phong_id)
                                         REFERENCES hang_phong (id) ON DELETE CASCADE,
                                     CONSTRAINT ck_gptn_price CHECK (price >= 0)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- TỒN KHO PHÒNG THEO NGÀY — cơ chế chống double-booking (Business Rule 1).
-- Mỗi (hạng phòng, ngày) là một dòng. Đặt phòng = UPDATE nguyên tử
-- sold = sold + n WHERE sold + n <= allotment. Không cần khóa thủ công.
-- ---------------------------------------------------------------------
CREATE TABLE ton_kho_phong (
                               hang_phong_id CHAR(36)  NOT NULL,
                               stay_date     DATE      NOT NULL,
                               allotment     SMALLINT  NOT NULL,   -- số phòng bán được của hạng này trong ngày
                               sold          SMALLINT  NOT NULL DEFAULT 0,
                               CONSTRAINT pk_ton_kho_phong PRIMARY KEY (hang_phong_id, stay_date),
                               CONSTRAINT fk_tkp_hang_phong FOREIGN KEY (hang_phong_id)
                                   REFERENCES hang_phong (id) ON DELETE CASCADE,
                               CONSTRAINT ck_tkp_sold CHECK (sold >= 0 AND sold <= allotment)
) ENGINE = InnoDB;

CREATE INDEX ix_ton_kho_ngay ON ton_kho_phong (stay_date);

-- ---------------------------------------------------------------------
-- Đơn đặt phòng (header). Khách đặt theo HẠNG PHÒNG; số phòng vật lý
-- chỉ được gán lúc check-in (UC09).
-- ---------------------------------------------------------------------
CREATE TABLE dat_phong (
                           id                  CHAR(36)      NOT NULL DEFAULT (UUID()),
                           booking_code        VARCHAR(20)   NOT NULL,
                           nguoi_dung_id       CHAR(36)          NULL,   -- NULL = đặt tại quầy cho khách vãng lai
                           contact_name        VARCHAR(150)  NOT NULL,   -- snapshot, không đổi khi hồ sơ bị ẩn danh
                           contact_email       VARCHAR(190)      NULL,
                           contact_phone       VARCHAR(20)       NULL,
                           check_in_date       DATE          NOT NULL,
                           check_out_date      DATE          NOT NULL,
                           num_adults          TINYINT       NOT NULL DEFAULT 1,
                           num_children        TINYINT       NOT NULL DEFAULT 0,
                           status              ENUM('PENDING','CONFIRMED','CHECKED_IN','CHECKED_OUT','CANCELLED','NO_SHOW')
                               NOT NULL DEFAULT 'PENDING',
                           deposit_amount      DECIMAL(15,2) NOT NULL DEFAULT 0,
                           estimated_total     DECIMAL(15,2) NOT NULL DEFAULT 0,
                           special_request     VARCHAR(500)      NULL,
                           cancelled_at        DATETIME          NULL,
                           refund_amount       DECIMAL(15,2)     NULL,   -- Business Rule 3
                           created_by          CHAR(36)          NULL,   -- lễ tân tạo hộ
                           created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP,
                           CONSTRAINT pk_dat_phong PRIMARY KEY (id),
                           CONSTRAINT uq_dat_phong_code UNIQUE (booking_code),
                           CONSTRAINT fk_dp_nguoi_dung FOREIGN KEY (nguoi_dung_id)
                               REFERENCES nguoi_dung (id) ON DELETE SET NULL,
                           CONSTRAINT fk_dp_created_by FOREIGN KEY (created_by)
                               REFERENCES nguoi_dung (id) ON DELETE SET NULL,
                           CONSTRAINT ck_dp_date_range CHECK (check_out_date > check_in_date)
) ENGINE = InnoDB;

CREATE INDEX ix_dat_phong_arrival  ON dat_phong (check_in_date, status);
CREATE INDEX ix_dat_phong_departure ON dat_phong (check_out_date, status);
CREATE INDEX ix_dat_phong_nguoi_dung ON dat_phong (nguoi_dung_id);

-- ---------------------------------------------------------------------
-- Dòng đặt phòng = một lượt lưu trú của một phòng. Đây cũng là bản ghi
-- check-in/check-out thực tế (không tách thêm bảng stay).
-- ---------------------------------------------------------------------
CREATE TABLE chi_tiet_dat_phong (
                                    id               CHAR(36)      NOT NULL DEFAULT (UUID()),
                                    dat_phong_id     CHAR(36)      NOT NULL,
                                    hang_phong_id    CHAR(36)      NOT NULL,
                                    phong_id         CHAR(36)          NULL,   -- gán lúc check-in
                                    rate_per_night   DECIMAL(15,2) NOT NULL,   -- giá chốt tại thời điểm đặt
                                    actual_check_in  DATETIME          NULL,
                                    actual_check_out DATETIME          NULL,
                                    checked_in_by    CHAR(36)          NULL,
                                    checked_out_by   CHAR(36)          NULL,
                                    CONSTRAINT pk_chi_tiet_dat_phong PRIMARY KEY (id),
                                    CONSTRAINT fk_ctdp_dat_phong FOREIGN KEY (dat_phong_id)
                                        REFERENCES dat_phong (id) ON DELETE CASCADE,
                                    CONSTRAINT fk_ctdp_hang_phong FOREIGN KEY (hang_phong_id)
                                        REFERENCES hang_phong (id) ON DELETE RESTRICT,
                                    CONSTRAINT fk_ctdp_phong FOREIGN KEY (phong_id)
                                        REFERENCES phong (id) ON DELETE RESTRICT,
                                    CONSTRAINT fk_ctdp_checkin_by FOREIGN KEY (checked_in_by)
                                        REFERENCES nguoi_dung (id) ON DELETE SET NULL,
                                    CONSTRAINT fk_ctdp_checkout_by FOREIGN KEY (checked_out_by)
                                        REFERENCES nguoi_dung (id) ON DELETE SET NULL
) ENGINE = InnoDB;

CREATE INDEX ix_ctdp_phong ON chi_tiet_dat_phong (phong_id, actual_check_out);

-- ---------------------------------------------------------------------
-- Khai báo lưu trú — Luật Cư trú 2020 & Thông tư 55/2021/TT-BCA.
-- Bắt buộc đủ trường cho mọi khách ở thực tế (kể cả khách đi kèm),
-- phục vụ xuất danh sách gửi công an phường/xã.
-- ---------------------------------------------------------------------
CREATE TABLE khai_bao_luu_tru (
                                  id                     CHAR(36)     NOT NULL DEFAULT (UUID()),
                                  chi_tiet_dat_phong_id  CHAR(36)     NOT NULL,
                                  full_name              VARCHAR(150) NOT NULL,
                                  date_of_birth          DATE         NOT NULL,
                                  gender                 ENUM('MALE','FEMALE','OTHER') NOT NULL,
                                  id_type                ENUM('CCCD','PASSPORT','OTHER') NOT NULL,
                                  id_number_encrypted    VARBINARY(512) NOT NULL,
                                  nationality            VARCHAR(80)  NOT NULL,
                                  permanent_address      VARCHAR(255)     NULL,
                                  is_primary_guest       TINYINT(1)   NOT NULL DEFAULT 0,
                                  declared_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                  exported_at            DATETIME         NULL,   -- thời điểm đưa vào báo cáo
                                  CONSTRAINT pk_khai_bao_luu_tru PRIMARY KEY (id),
                                  CONSTRAINT fk_kblt_ctdp FOREIGN KEY (chi_tiet_dat_phong_id)
                                      REFERENCES chi_tiet_dat_phong (id) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE INDEX ix_kblt_declared ON khai_bao_luu_tru (declared_at);


-- =====================================================================
-- MODULE 3 — NHÀ HÀNG: THỰC ĐƠN, BÀN, ĐẶT BÀN, ĐƠN MÓN (KOT)
-- =====================================================================

CREATE TABLE nhom_mon_an (
                             id         CHAR(36)     NOT NULL DEFAULT (UUID()),
                             name       VARCHAR(100) NOT NULL,
                             sort_order SMALLINT     NOT NULL DEFAULT 0,
                             is_active  TINYINT(1)   NOT NULL DEFAULT 1,
                             CONSTRAINT pk_nhom_mon_an PRIMARY KEY (id),
                             CONSTRAINT uq_nhom_mon_an_name UNIQUE (name)
) ENGINE = InnoDB;

CREATE TABLE mon_an (
                        id             CHAR(36)      NOT NULL DEFAULT (UUID()),
                        nhom_mon_an_id CHAR(36)      NOT NULL,
                        code           VARCHAR(20)   NOT NULL,
                        name           VARCHAR(150)  NOT NULL,
                        description    VARCHAR(500)      NULL,
                        price          DECIMAL(15,2) NOT NULL,
                        image_url      VARCHAR(500)      NULL,
                        prep_minutes   SMALLINT          NULL,
                        is_available   TINYINT(1)    NOT NULL DEFAULT 1,
                        created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
                        CONSTRAINT pk_mon_an PRIMARY KEY (id),
                        CONSTRAINT uq_mon_an_code UNIQUE (code),
                        CONSTRAINT fk_ma_nhom FOREIGN KEY (nhom_mon_an_id)
                            REFERENCES nhom_mon_an (id) ON DELETE RESTRICT,
                        CONSTRAINT ck_mon_an_price CHECK (price >= 0)
) ENGINE = InnoDB;

CREATE TABLE ban_an (
                        id           CHAR(36)    NOT NULL DEFAULT (UUID()),
                        table_number VARCHAR(10) NOT NULL,
                        capacity     TINYINT     NOT NULL,
                        zone         VARCHAR(50)     NULL,   -- Indoor / Poolside / Terrace
                        is_active    TINYINT(1)  NOT NULL DEFAULT 1,
                        CONSTRAINT pk_ban_an PRIMARY KEY (id),
                        CONSTRAINT uq_ban_an_number UNIQUE (table_number),
                        CONSTRAINT ck_ban_an_capacity CHECK (capacity > 0)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Đặt bàn theo KHUNG GIỜ (khác hẳn cơ chế đặt phòng theo khoảng ngày).
-- active_slot là cột sinh: NULL khi đơn đã hủy, nhờ đó UNIQUE index
-- không chặn việc đặt lại cùng bàn/cùng giờ sau khi hủy.
-- ---------------------------------------------------------------------
CREATE TABLE dat_ban (
                         id               CHAR(36)  NOT NULL DEFAULT (UUID()),
                         nguoi_dung_id    CHAR(36)      NULL,
                         dat_phong_id     CHAR(36)      NULL,   -- khách đang lưu trú
                         ban_an_id        CHAR(36)  NOT NULL,
                         reservation_date DATE      NOT NULL,
                         slot_start       TIME      NOT NULL,
                         slot_end         TIME      NOT NULL,
                         party_size       TINYINT   NOT NULL,
                         contact_name     VARCHAR(150) NOT NULL,
                         contact_phone    VARCHAR(20)  NULL,
                         status           ENUM('CONFIRMED','SEATED','COMPLETED','CANCELLED','NO_SHOW')
                             NOT NULL DEFAULT 'CONFIRMED',
                         note             VARCHAR(300) NULL,
                         created_at       DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         active_slot      CHAR(1) GENERATED ALWAYS AS
                             (IF(status IN ('CANCELLED','NO_SHOW'), NULL, 'Y')) STORED,
                         CONSTRAINT pk_dat_ban PRIMARY KEY (id),
                         CONSTRAINT uq_dat_ban_slot UNIQUE (ban_an_id, reservation_date, slot_start, active_slot),
                         CONSTRAINT fk_db_nguoi_dung FOREIGN KEY (nguoi_dung_id)
                             REFERENCES nguoi_dung (id) ON DELETE SET NULL,
                         CONSTRAINT fk_db_dat_phong FOREIGN KEY (dat_phong_id)
                             REFERENCES dat_phong (id) ON DELETE SET NULL,
                         CONSTRAINT fk_db_ban_an FOREIGN KEY (ban_an_id)
                             REFERENCES ban_an (id) ON DELETE RESTRICT,
                         CONSTRAINT ck_db_slot CHECK (slot_end > slot_start),
                         CONSTRAINT ck_db_party CHECK (party_size > 0)
) ENGINE = InnoDB;

CREATE INDEX ix_dat_ban_ngay ON dat_ban (reservation_date, slot_start);

-- ---------------------------------------------------------------------
-- Đơn món = KOT (Kitchen Order Ticket). charge_to_room quyết định
-- đơn này có được đẩy vào folio hay thu tiền ngay.
-- ---------------------------------------------------------------------
CREATE TABLE don_mon (
                         id             CHAR(36)      NOT NULL DEFAULT (UUID()),
                         order_code     VARCHAR(20)   NOT NULL,
                         order_type     ENUM('ROOM_SERVICE','DINE_IN','TAKEAWAY') NOT NULL,
                         dat_phong_id   CHAR(36)          NULL,   -- bắt buộc khi charge_to_room = 1
                         ban_an_id      CHAR(36)          NULL,
                         nguoi_dung_id  CHAR(36)          NULL,
                         status         ENUM('PENDING','PREPARING','SERVED','CANCELLED')
                             NOT NULL DEFAULT 'PENDING',
                         charge_to_room TINYINT(1)    NOT NULL DEFAULT 0,
                         total_amount   DECIMAL(15,2) NOT NULL DEFAULT 0,
                         note           VARCHAR(300)      NULL,
                         ordered_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         served_at      DATETIME          NULL,
                         handled_by     CHAR(36)          NULL,
                         CONSTRAINT pk_don_mon PRIMARY KEY (id),
                         CONSTRAINT uq_don_mon_code UNIQUE (order_code),
                         CONSTRAINT fk_dm_dat_phong FOREIGN KEY (dat_phong_id)
                             REFERENCES dat_phong (id) ON DELETE RESTRICT,
                         CONSTRAINT fk_dm_ban_an FOREIGN KEY (ban_an_id)
                             REFERENCES ban_an (id) ON DELETE SET NULL,
                         CONSTRAINT fk_dm_nguoi_dung FOREIGN KEY (nguoi_dung_id)
                             REFERENCES nguoi_dung (id) ON DELETE SET NULL,
                         CONSTRAINT fk_dm_handled_by FOREIGN KEY (handled_by)
                             REFERENCES nguoi_dung (id) ON DELETE SET NULL,
                         CONSTRAINT ck_dm_charge_to_room CHECK (charge_to_room = 0 OR dat_phong_id IS NOT NULL)
) ENGINE = InnoDB;

CREATE INDEX ix_don_mon_kitchen ON don_mon (status, ordered_at);
CREATE INDEX ix_don_mon_dat_phong ON don_mon (dat_phong_id);

CREATE TABLE chi_tiet_don_mon (
                                  id         CHAR(36)      NOT NULL DEFAULT (UUID()),
                                  don_mon_id CHAR(36)      NOT NULL,
                                  mon_an_id  CHAR(36)      NOT NULL,
                                  quantity   SMALLINT      NOT NULL,
                                  unit_price DECIMAL(15,2) NOT NULL,   -- snapshot giá tại thời điểm gọi món
                                  note       VARCHAR(200)      NULL,
                                  line_total DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
                                  CONSTRAINT pk_chi_tiet_don_mon PRIMARY KEY (id),
                                  CONSTRAINT fk_ctdm_don_mon FOREIGN KEY (don_mon_id)
                                      REFERENCES don_mon (id) ON DELETE CASCADE,
                                  CONSTRAINT fk_ctdm_mon_an FOREIGN KEY (mon_an_id)
                                      REFERENCES mon_an (id) ON DELETE RESTRICT,
                                  CONSTRAINT ck_ctdm_quantity CHECK (quantity > 0)
) ENGINE = InnoDB;

CREATE TABLE lich_su_trang_thai_don (
                                        id          CHAR(36) NOT NULL DEFAULT (UUID()),
                                        don_mon_id  CHAR(36) NOT NULL,
                                        from_status VARCHAR(20)  NULL,
                                        to_status   VARCHAR(20) NOT NULL,
                                        changed_by  CHAR(36)     NULL,
                                        changed_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                        CONSTRAINT pk_lich_su_trang_thai_don PRIMARY KEY (id),
                                        CONSTRAINT fk_lsttd_don_mon FOREIGN KEY (don_mon_id)
                                            REFERENCES don_mon (id) ON DELETE CASCADE,
                                        CONSTRAINT fk_lsttd_changed_by FOREIGN KEY (changed_by)
                                            REFERENCES nguoi_dung (id) ON DELETE SET NULL
) ENGINE = InnoDB;


-- =====================================================================
-- MODULE 4 — TOUR: CATALOG, LỊCH KHỞI HÀNH, ĐẶT TOUR, ĐÁNH GIÁ
-- =====================================================================

CREATE TABLE tour (
                      id                CHAR(36)      NOT NULL DEFAULT (UUID()),
                      code              VARCHAR(20)   NOT NULL,
                      name              VARCHAR(180)  NOT NULL,
                      description       TEXT              NULL,
                      itinerary         TEXT              NULL,
                      duration_hours    DECIMAL(5,2)  NOT NULL,
                      price_per_person  DECIMAL(15,2) NOT NULL,
                      min_participants  TINYINT       NOT NULL DEFAULT 1,
                      meeting_point     VARCHAR(255)      NULL,
                      latitude          DECIMAL(10,7)     NULL,   -- Google Maps / OpenWeather
                      longitude         DECIMAL(10,7)     NULL,
    -- Luật Du lịch 2017, Chương VI: 3 trường bắt buộc hiển thị
                      safety_warning    TEXT          NOT NULL,
                      insurance_info    TEXT          NOT NULL,
                      refund_policy     TEXT          NOT NULL,
                      is_active         TINYINT(1)    NOT NULL DEFAULT 1,
                      created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
                      updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                          ON UPDATE CURRENT_TIMESTAMP,
                      CONSTRAINT pk_tour PRIMARY KEY (id),
                      CONSTRAINT uq_tour_code UNIQUE (code),
                      CONSTRAINT ck_tour_price CHECK (price_per_person >= 0)
) ENGINE = InnoDB;

CREATE TABLE anh_tour (
                          id         CHAR(36)     NOT NULL DEFAULT (UUID()),
                          tour_id    CHAR(36)     NOT NULL,
                          image_url  VARCHAR(500) NOT NULL,
                          caption    VARCHAR(200)     NULL,
                          sort_order SMALLINT     NOT NULL DEFAULT 0,
                          CONSTRAINT pk_anh_tour PRIMARY KEY (id),
                          CONSTRAINT fk_at_tour FOREIGN KEY (tour_id)
                              REFERENCES tour (id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Lịch khởi hành = TỒN KHO CHỖ NGỒI. Khác đặt phòng ở chỗ đây là đếm
-- chỗ còn lại, không phải khóa độc quyền một tài nguyên.
-- ---------------------------------------------------------------------
CREATE TABLE lich_khoi_hanh_tour (
                                     id             CHAR(36)  NOT NULL DEFAULT (UUID()),
                                     tour_id        CHAR(36)  NOT NULL,
                                     departure_date DATE      NOT NULL,
                                     departure_time TIME          NULL,
                                     capacity       SMALLINT  NOT NULL,
                                     booked_seats   SMALLINT  NOT NULL DEFAULT 0,
                                     guide_id       CHAR(36)      NULL,   -- Tour Guide, xem manifest (UC17)
                                     status         ENUM('SCHEDULED','FULL','DEPARTED','COMPLETED','CANCELLED')
                                         NOT NULL DEFAULT 'SCHEDULED',
                                     CONSTRAINT pk_lich_khoi_hanh_tour PRIMARY KEY (id),
                                     CONSTRAINT uq_lkht_tour_date UNIQUE (tour_id, departure_date, departure_time),
                                     CONSTRAINT fk_lkht_tour FOREIGN KEY (tour_id)
                                         REFERENCES tour (id) ON DELETE CASCADE,
                                     CONSTRAINT fk_lkht_guide FOREIGN KEY (guide_id)
                                         REFERENCES nguoi_dung (id) ON DELETE SET NULL,
                                     CONSTRAINT ck_lkht_seats CHECK (booked_seats >= 0 AND booked_seats <= capacity)
) ENGINE = InnoDB;

CREATE INDEX ix_lkht_guide_ngay ON lich_khoi_hanh_tour (guide_id, departure_date);

CREATE TABLE dat_tour (
                          id                 CHAR(36)      NOT NULL DEFAULT (UUID()),
                          booking_code       VARCHAR(20)   NOT NULL,
                          lich_khoi_hanh_id  CHAR(36)      NOT NULL,
                          nguoi_dung_id      CHAR(36)          NULL,
                          dat_phong_id       CHAR(36)          NULL,   -- bắt buộc khi charge_to_room = 1
                          contact_name       VARCHAR(150)  NOT NULL,
                          contact_phone      VARCHAR(20)       NULL,
                          num_participants   SMALLINT      NOT NULL,
                          unit_price         DECIMAL(15,2) NOT NULL,
                          total_amount       DECIMAL(15,2) GENERATED ALWAYS AS (num_participants * unit_price) STORED,
                          charge_to_room     TINYINT(1)    NOT NULL DEFAULT 0,
                          status             ENUM('PENDING','CONFIRMED','COMPLETED','CANCELLED','NO_SHOW')
                              NOT NULL DEFAULT 'PENDING',
                          qr_ticket_code     VARCHAR(100)      NULL,   -- gửi qua Email/SMS API
                          created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          cancelled_at       DATETIME          NULL,
                          CONSTRAINT pk_dat_tour PRIMARY KEY (id),
                          CONSTRAINT uq_dat_tour_code UNIQUE (booking_code),
                          CONSTRAINT fk_dt_lkht FOREIGN KEY (lich_khoi_hanh_id)
                              REFERENCES lich_khoi_hanh_tour (id) ON DELETE RESTRICT,
                          CONSTRAINT fk_dt_nguoi_dung FOREIGN KEY (nguoi_dung_id)
                              REFERENCES nguoi_dung (id) ON DELETE SET NULL,
                          CONSTRAINT fk_dt_dat_phong FOREIGN KEY (dat_phong_id)
                              REFERENCES dat_phong (id) ON DELETE RESTRICT,
                          CONSTRAINT ck_dt_participants CHECK (num_participants > 0),
                          CONSTRAINT ck_dt_charge_to_room CHECK (charge_to_room = 0 OR dat_phong_id IS NOT NULL)
) ENGINE = InnoDB;

CREATE INDEX ix_dat_tour_lkht ON dat_tour (lich_khoi_hanh_id, status);
CREATE INDEX ix_dat_tour_dat_phong ON dat_tour (dat_phong_id);

-- ---------------------------------------------------------------------
-- Đánh giá đa đối tượng (phòng / tour / nhà hàng) — UC18, UC19.
-- Ràng buộc "chỉ đánh giá sau khi trải nghiệm" thực thi ở tầng service.
-- ---------------------------------------------------------------------
CREATE TABLE danh_gia (
                          id             CHAR(36)  NOT NULL DEFAULT (UUID()),
                          nguoi_dung_id  CHAR(36)  NOT NULL,
                          target_type    ENUM('ROOM_STAY','TOUR','RESTAURANT') NOT NULL,
                          target_id      CHAR(36)  NOT NULL,   -- dat_phong.id | dat_tour.id | don_mon.id
                          rating         TINYINT   NOT NULL,
                          comment        TEXT          NULL,
                          is_visible     TINYINT(1) NOT NULL DEFAULT 1,
                          moderated_by   CHAR(36)      NULL,
                          moderated_at   DATETIME      NULL,
                          created_at     DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          CONSTRAINT pk_danh_gia PRIMARY KEY (id),
                          CONSTRAINT uq_danh_gia_target UNIQUE (nguoi_dung_id, target_type, target_id),
                          CONSTRAINT fk_dg_nguoi_dung FOREIGN KEY (nguoi_dung_id)
                              REFERENCES nguoi_dung (id) ON DELETE CASCADE,
                          CONSTRAINT fk_dg_moderated_by FOREIGN KEY (moderated_by)
                              REFERENCES nguoi_dung (id) ON DELETE SET NULL,
                          CONSTRAINT ck_dg_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE = InnoDB;

CREATE INDEX ix_danh_gia_target ON danh_gia (target_type, target_id, is_visible);


-- =====================================================================
-- MODULE 5 — FOLIO, HÓA ĐƠN HỢP NHẤT, THANH TOÁN, NIGHT AUDIT
-- =====================================================================

-- ---------------------------------------------------------------------
-- Ngày làm việc (business date) — tách khỏi ngày hệ thống. Night audit
-- đóng ngày, post tiền phòng và chốt số liệu công suất/doanh thu.
-- ---------------------------------------------------------------------
CREATE TABLE ngay_lam_viec (
                               business_date    DATE          NOT NULL,
                               status           ENUM('OPEN','CLOSED') NOT NULL DEFAULT 'OPEN',
                               rooms_available  SMALLINT      NOT NULL DEFAULT 0,
                               rooms_sold       SMALLINT      NOT NULL DEFAULT 0,
                               occupancy_rate   DECIMAL(5,2)  NOT NULL DEFAULT 0,   -- UC22
                               room_revenue     DECIMAL(15,2) NOT NULL DEFAULT 0,   -- USALI: Rooms
                               fnb_revenue      DECIMAL(15,2) NOT NULL DEFAULT 0,   -- USALI: Food & Beverage
                               tour_revenue     DECIMAL(15,2) NOT NULL DEFAULT 0,   -- USALI: Minor Operated
                               closed_at        DATETIME          NULL,
                               closed_by        CHAR(36)          NULL,
                               CONSTRAINT pk_ngay_lam_viec PRIMARY KEY (business_date),
                               CONSTRAINT fk_nlv_closed_by FOREIGN KEY (closed_by)
                                   REFERENCES nguoi_dung (id) ON DELETE SET NULL
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- FOLIO — sổ ghi nợ của một lượt lưu trú. Một đơn đặt phòng một folio.
-- ---------------------------------------------------------------------
CREATE TABLE so_khach (
                          id           CHAR(36)    NOT NULL DEFAULT (UUID()),
                          folio_number VARCHAR(20) NOT NULL,
                          dat_phong_id CHAR(36)    NOT NULL,
                          status       ENUM('OPEN','CLOSED') NOT NULL DEFAULT 'OPEN',
                          opened_at    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          closed_at    DATETIME        NULL,
                          CONSTRAINT pk_so_khach PRIMARY KEY (id),
                          CONSTRAINT uq_so_khach_number UNIQUE (folio_number),
                          CONSTRAINT uq_so_khach_dat_phong UNIQUE (dat_phong_id),
                          CONSTRAINT fk_sk_dat_phong FOREIGN KEY (dat_phong_id)
                              REFERENCES dat_phong (id) ON DELETE RESTRICT
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- GIAO DỊCH FOLIO — bảng trung tâm của cả hệ thống. Mọi phát sinh từ
-- 3 nguồn doanh thu và mọi khoản thu đều là một dòng ở đây.
-- APPEND-ONLY: sửa sai bằng dòng đối ứng (reversal_of_id), không UPDATE.
-- Số dư = SUM(signed_amount); DEBIT (+) là ghi nợ khách, CREDIT (-) là thu.
-- ---------------------------------------------------------------------
CREATE TABLE giao_dich_so_khach (
                                    id               CHAR(36)      NOT NULL DEFAULT (UUID()),
                                    so_khach_id      CHAR(36)      NOT NULL,
                                    transaction_type ENUM('ROOM','FNB','TOUR','SERVICE_CHARGE','VAT','PAYMENT','REFUND','ADJUSTMENT')
                                                                   NOT NULL,
                                    direction        ENUM('DEBIT','CREDIT') NOT NULL,
                                    amount           DECIMAL(15,2) NOT NULL,
                                    signed_amount    DECIMAL(15,2) GENERATED ALWAYS AS
                                        (IF(direction = 'DEBIT', amount, -amount)) STORED,
                                    description      VARCHAR(255)  NOT NULL,
                                    source_ref_type  ENUM('ROOM_NIGHT','FOOD_ORDER','TOUR_BOOKING','PAYMENT','MANUAL')
                                        NOT NULL,
                                    source_ref_id    CHAR(36)          NULL,
                                    business_date    DATE          NOT NULL,
                                    posted_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                    posted_by        CHAR(36)          NULL,
                                    reversal_of_id   CHAR(36)          NULL,
                                    CONSTRAINT pk_giao_dich_so_khach PRIMARY KEY (id),
                                    CONSTRAINT fk_gdsk_so_khach FOREIGN KEY (so_khach_id)
                                        REFERENCES so_khach (id) ON DELETE RESTRICT,
                                    CONSTRAINT fk_gdsk_posted_by FOREIGN KEY (posted_by)
                                        REFERENCES nguoi_dung (id) ON DELETE SET NULL,
                                    CONSTRAINT fk_gdsk_reversal FOREIGN KEY (reversal_of_id)
                                        REFERENCES giao_dich_so_khach (id) ON DELETE RESTRICT,
                                    CONSTRAINT ck_gdsk_amount CHECK (amount > 0)
) ENGINE = InnoDB;

CREATE INDEX ix_gdsk_so_khach ON giao_dich_so_khach (so_khach_id, posted_at);
CREATE INDEX ix_gdsk_bao_cao  ON giao_dich_so_khach (business_date, transaction_type);
CREATE INDEX ix_gdsk_source   ON giao_dich_so_khach (source_ref_type, source_ref_id);

-- ---------------------------------------------------------------------
-- Hóa đơn hợp nhất (UC20). Chỉ được phát hành khi folio đã đủ dòng.
-- ---------------------------------------------------------------------
CREATE TABLE hoa_don (
                         id                  CHAR(36)      NOT NULL DEFAULT (UUID()),
                         invoice_number      VARCHAR(30)   NOT NULL,
                         so_khach_id         CHAR(36)      NOT NULL,
                         room_subtotal       DECIMAL(15,2) NOT NULL DEFAULT 0,
                         fnb_subtotal        DECIMAL(15,2) NOT NULL DEFAULT 0,
                         tour_subtotal       DECIMAL(15,2) NOT NULL DEFAULT 0,
                         service_charge_rate DECIMAL(5,2)  NOT NULL DEFAULT 5.00,
                         service_charge      DECIMAL(15,2) NOT NULL DEFAULT 0,
                         vat_rate            DECIMAL(5,2)  NOT NULL DEFAULT 8.00,
                         vat_amount          DECIMAL(15,2) NOT NULL DEFAULT 0,
                         deposit_applied     DECIMAL(15,2) NOT NULL DEFAULT 0,
                         total_amount        DECIMAL(15,2) NOT NULL DEFAULT 0,
                         status              ENUM('DRAFT','ISSUED','PAID','VOID') NOT NULL DEFAULT 'DRAFT',
                         issued_at           DATETIME          NULL,
                         paid_at             DATETIME          NULL,
                         issued_by           CHAR(36)          NULL,
                         CONSTRAINT pk_hoa_don PRIMARY KEY (id),
                         CONSTRAINT uq_hoa_don_number UNIQUE (invoice_number),
                         CONSTRAINT fk_hd_so_khach FOREIGN KEY (so_khach_id)
                             REFERENCES so_khach (id) ON DELETE RESTRICT,
                         CONSTRAINT fk_hd_issued_by FOREIGN KEY (issued_by)
                             REFERENCES nguoi_dung (id) ON DELETE SET NULL
) ENGINE = InnoDB;

CREATE TABLE chi_tiet_hoa_don (
                                  id          CHAR(36)      NOT NULL DEFAULT (UUID()),
                                  hoa_don_id  CHAR(36)      NOT NULL,
                                  line_group  ENUM('ROOM','FNB','TOUR','OTHER') NOT NULL,
                                  description VARCHAR(255)  NOT NULL,
                                  quantity    DECIMAL(10,2) NOT NULL DEFAULT 1,
                                  unit_price  DECIMAL(15,2) NOT NULL,
                                  line_total  DECIMAL(15,2) NOT NULL,
                                  sort_order  SMALLINT      NOT NULL DEFAULT 0,
                                  CONSTRAINT pk_chi_tiet_hoa_don PRIMARY KEY (id),
                                  CONSTRAINT fk_cthd_hoa_don FOREIGN KEY (hoa_don_id)
                                      REFERENCES hoa_don (id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Thanh toán — dùng chung cho đặt cọc lúc booking (UC07) và thanh toán
-- cuối lúc check-out (UC21). refund_of_id phục vụ hoàn cọc (BR3).
-- ---------------------------------------------------------------------
CREATE TABLE thanh_toan (
                            id               CHAR(36)      NOT NULL DEFAULT (UUID()),
                            payment_code     VARCHAR(30)   NOT NULL,
                            payment_scope    ENUM('DEPOSIT','FINAL_INVOICE','TOUR_DIRECT','FNB_DIRECT','REFUND')
                                                           NOT NULL,
                            dat_phong_id     CHAR(36)          NULL,
                            hoa_don_id       CHAR(36)          NULL,
                            dat_tour_id      CHAR(36)          NULL,
                            don_mon_id       CHAR(36)          NULL,
                            method           ENUM('CASH','CARD','VNPAY','STRIPE','BANK_TRANSFER') NOT NULL,
                            amount           DECIMAL(15,2) NOT NULL,
                            currency         CHAR(3)       NOT NULL DEFAULT 'VND',
                            status           ENUM('INITIATED','SUCCEEDED','FAILED','REFUNDED') NOT NULL DEFAULT 'INITIATED',
                            gateway_txn_id   VARCHAR(100)      NULL,
                            gateway_response JSON              NULL,
                            refund_of_id     CHAR(36)          NULL,
                            paid_at          DATETIME          NULL,
                            created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            CONSTRAINT pk_thanh_toan PRIMARY KEY (id),
                            CONSTRAINT uq_thanh_toan_code UNIQUE (payment_code),
                            CONSTRAINT fk_tt_dat_phong FOREIGN KEY (dat_phong_id)
                                REFERENCES dat_phong (id) ON DELETE RESTRICT,
                            CONSTRAINT fk_tt_hoa_don FOREIGN KEY (hoa_don_id)
                                REFERENCES hoa_don (id) ON DELETE RESTRICT,
                            CONSTRAINT fk_tt_dat_tour FOREIGN KEY (dat_tour_id)
                                REFERENCES dat_tour (id) ON DELETE RESTRICT,
                            CONSTRAINT fk_tt_don_mon FOREIGN KEY (don_mon_id)
                                REFERENCES don_mon (id) ON DELETE RESTRICT,
                            CONSTRAINT fk_tt_refund_of FOREIGN KEY (refund_of_id)
                                REFERENCES thanh_toan (id) ON DELETE RESTRICT,
                            CONSTRAINT ck_tt_amount CHECK (amount > 0)
) ENGINE = InnoDB;

CREATE INDEX ix_thanh_toan_gateway ON thanh_toan (gateway_txn_id);


-- =====================================================================
-- HẠ TẦNG DÙNG CHUNG — nhật ký gửi Email/SMS
-- =====================================================================

CREATE TABLE nhat_ky_thong_bao (
                                   id           CHAR(36)  NOT NULL DEFAULT (UUID()),
                                   channel      ENUM('EMAIL','SMS') NOT NULL,
                                   template_code VARCHAR(50) NOT NULL,   -- BOOKING_CONFIRM, TOUR_QR, INVOICE...
                                   recipient    VARCHAR(190) NOT NULL,
                                   subject      VARCHAR(200)     NULL,
                                   payload      JSON             NULL,
                                   status       ENUM('QUEUED','SENT','FAILED') NOT NULL DEFAULT 'QUEUED',
                                   provider_id  VARCHAR(100)     NULL,
                                   error_message VARCHAR(500)    NULL,
                                   created_at   DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   sent_at      DATETIME      NULL,
                                   CONSTRAINT pk_nhat_ky_thong_bao PRIMARY KEY (id)
) ENGINE = InnoDB;

CREATE INDEX ix_nktb_status ON nhat_ky_thong_bao (status, created_at);


-- =====================================================================
-- TRIGGER — bảo vệ tính bất biến của sổ folio
-- =====================================================================

DELIMITER $$

CREATE TRIGGER trg_gdsk_no_update
    BEFORE UPDATE ON giao_dich_so_khach
    FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Folio la append-only: hay ghi dong doi ung thay vi sua.';
END$$

CREATE TRIGGER trg_gdsk_no_delete
    BEFORE DELETE ON giao_dich_so_khach
    FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Folio la append-only: khong duoc xoa giao dich.';
END$$

DELIMITER ;


-- =====================================================================
-- VIEW — số dư folio, tồn phòng, doanh thu
-- =====================================================================

-- Số dư hiện tại của từng folio. Business Rule 2 (chặn check-out khi
-- còn nợ) chỉ cần kiểm balance = 0 trên view này.
CREATE OR REPLACE VIEW v_so_du_folio AS
SELECT  sk.id                                   AS so_khach_id,
        sk.folio_number,
        sk.dat_phong_id,
        sk.status,
        COALESCE(SUM(g.signed_amount), 0)       AS balance,
        COALESCE(SUM(CASE WHEN g.direction = 'DEBIT'  THEN g.amount END), 0) AS total_charges,
        COALESCE(SUM(CASE WHEN g.direction = 'CREDIT' THEN g.amount END), 0) AS total_payments
FROM    so_khach sk
            LEFT JOIN giao_dich_so_khach g ON g.so_khach_id = sk.id
GROUP BY sk.id, sk.folio_number, sk.dat_phong_id, sk.status;

-- Số phòng còn trống theo hạng và theo ngày (UC06).
CREATE OR REPLACE VIEW v_phong_trong AS
SELECT  t.hang_phong_id,
        h.code            AS room_type_code,
        h.name            AS room_type_name,
        t.stay_date,
        t.allotment,
        t.sold,
        (t.allotment - t.sold) AS available,
        COALESCE(g.price, h.base_price) AS price
FROM    ton_kho_phong t
            JOIN    hang_phong h ON h.id = t.hang_phong_id
            LEFT JOIN gia_phong_theo_ngay g
                      ON g.hang_phong_id = t.hang_phong_id AND g.rate_date = t.stay_date
WHERE   h.is_active = 1;

-- Doanh thu theo nguồn (UC23) — phân loại theo nhóm USALI.
CREATE OR REPLACE VIEW v_doanh_thu_theo_nguon AS
SELECT  g.business_date,
        CASE g.transaction_type
            WHEN 'ROOM' THEN 'Rooms'
            WHEN 'FNB'  THEN 'Food & Beverage'
            WHEN 'TOUR' THEN 'Minor Operated Departments'
            ELSE 'Other'
            END                       AS revenue_center,
        SUM(g.signed_amount)      AS revenue
FROM    giao_dich_so_khach g
WHERE   g.transaction_type IN ('ROOM','FNB','TOUR')
GROUP BY g.business_date, revenue_center;

-- Manifest tour cho hướng dẫn viên (UC17).
CREATE OR REPLACE VIEW v_manifest_tour AS
SELECT  l.id              AS lich_khoi_hanh_id,
        t.name            AS tour_name,
        l.departure_date,
        l.departure_time,
        l.guide_id,
        d.booking_code,
        d.contact_name,
        d.contact_phone,
        d.num_participants,
        d.status
FROM    lich_khoi_hanh_tour l
            JOIN    tour t     ON t.id = l.tour_id
            JOIN    dat_tour d ON d.lich_khoi_hanh_id = l.id
WHERE   d.status IN ('CONFIRMED','COMPLETED');


-- =====================================================================
-- STORED PROCEDURE — nghiệp vụ có ràng buộc đồng thời
-- =====================================================================

DELIMITER $$

-- ---------------------------------------------------------------------
-- Khởi tạo tồn kho phòng cho một khoảng ngày. allotment mặc định =
-- số phòng vật lý đang IN_SERVICE của hạng đó.
-- ---------------------------------------------------------------------
CREATE PROCEDURE sp_khoi_tao_ton_kho(
    IN p_from DATE,
    IN p_to   DATE
)
BEGIN
    INSERT INTO ton_kho_phong (hang_phong_id, stay_date, allotment, sold)
    SELECT h.id, d.dt, COUNT(p.id), 0
    FROM   hang_phong h
               JOIN   phong p ON p.hang_phong_id = h.id AND p.service_status = 'IN_SERVICE'
               JOIN (
        WITH RECURSIVE seq AS (
            SELECT p_from AS dt
            UNION ALL
            SELECT dt + INTERVAL 1 DAY FROM seq WHERE dt < p_to
        )
        SELECT dt FROM seq
    ) d
    WHERE  h.is_active = 1
    GROUP BY h.id, d.dt
    ON DUPLICATE KEY UPDATE allotment = VALUES(allotment);
END$$

-- ---------------------------------------------------------------------
-- Giữ chỗ phòng — chống double-booking bằng một UPDATE nguyên tử.
-- Nếu số dòng cập nhật khác số đêm cần đặt thì có ngày hết phòng.
-- ---------------------------------------------------------------------
CREATE PROCEDURE sp_giu_cho_phong(
    IN p_hang_phong_id CHAR(36),
    IN p_check_in      DATE,
    IN p_check_out     DATE,
    IN p_rooms         SMALLINT
)
BEGIN
    DECLARE v_nights INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            ROLLBACK;
            RESIGNAL;
        END;

    SET v_nights = DATEDIFF(p_check_out, p_check_in);

    START TRANSACTION;

    UPDATE ton_kho_phong
    SET    sold = sold + p_rooms
    WHERE  hang_phong_id = p_hang_phong_id
      AND  stay_date >= p_check_in
      AND  stay_date <  p_check_out
      AND  sold + p_rooms <= allotment;

    IF ROW_COUNT() <> v_nights THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Het phong cho mot hoac nhieu dem trong khoang da chon.';
    ELSE
        COMMIT;
    END IF;
END$$

-- ---------------------------------------------------------------------
-- Giữ chỗ tour — cùng nguyên lý, nhưng trên capacity chỗ ngồi.
-- ---------------------------------------------------------------------
CREATE PROCEDURE sp_giu_cho_tour(
    IN p_lich_khoi_hanh_id CHAR(36),
    IN p_seats             SMALLINT
)
BEGIN
    UPDATE lich_khoi_hanh_tour
    SET    booked_seats = booked_seats + p_seats,
           status = IF(booked_seats + p_seats >= capacity, 'FULL', status)
    WHERE  id = p_lich_khoi_hanh_id
      AND  status IN ('SCHEDULED','FULL')
      AND  booked_seats + p_seats <= capacity;

    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Khong du cho trong cho lich khoi hanh nay.';
    END IF;
END$$

-- ---------------------------------------------------------------------
-- Đẩy đơn ăn vào folio (Charge-to-Room). Gọi khi đơn chuyển SERVED.
-- ---------------------------------------------------------------------
CREATE PROCEDURE sp_post_don_mon_vao_folio(
    IN p_don_mon_id  CHAR(36),
    IN p_business_date DATE,
    IN p_posted_by   CHAR(36)
)
BEGIN
    DECLARE v_so_khach_id CHAR(36);
    DECLARE v_amount      DECIMAL(15,2);
    DECLARE v_code        VARCHAR(20);

    SELECT sk.id, dm.total_amount, dm.order_code
    INTO v_so_khach_id, v_amount, v_code
    FROM   don_mon dm
               JOIN   so_khach sk ON sk.dat_phong_id = dm.dat_phong_id
    WHERE  dm.id = p_don_mon_id
      AND  dm.charge_to_room = 1
      AND  sk.status = 'OPEN';

    IF v_so_khach_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Khong tim thay folio dang mo cho don mon nay.';
    END IF;

    INSERT INTO giao_dich_so_khach
    (so_khach_id, transaction_type, direction, amount, description,
     source_ref_type, source_ref_id, business_date, posted_by)
    VALUES
        (v_so_khach_id, 'FNB', 'DEBIT', v_amount,
         CONCAT('Dich vu an uong - don ', v_code),
         'FOOD_ORDER', p_don_mon_id, p_business_date, p_posted_by);
END$$

-- ---------------------------------------------------------------------
-- NIGHT AUDIT — post tiền phòng từng đêm cho mọi khách đang lưu trú,
-- chốt công suất và doanh thu, đóng ngày làm việc.
-- ---------------------------------------------------------------------
CREATE PROCEDURE sp_night_audit(
    IN p_business_date DATE,
    IN p_user_id       CHAR(36)
)
BEGIN
    DECLARE v_status VARCHAR(10);

    SELECT status INTO v_status
    FROM   ngay_lam_viec WHERE business_date = p_business_date;

    IF v_status = 'CLOSED' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Ngay lam viec da duoc dong truoc do.';
    END IF;

    INSERT IGNORE INTO ngay_lam_viec (business_date) VALUES (p_business_date);

    -- 1. Post tiền phòng cho từng phòng đang có khách
    INSERT INTO giao_dich_so_khach
    (so_khach_id, transaction_type, direction, amount, description,
     source_ref_type, source_ref_id, business_date, posted_by)
    SELECT sk.id, 'ROOM', 'DEBIT', ct.rate_per_night,
           CONCAT('Tien phong dem ', DATE_FORMAT(p_business_date, '%d/%m/%Y'),
                  ' - phong ', COALESCE(p.room_number, '')),
           'ROOM_NIGHT', ct.id, p_business_date, p_user_id
    FROM   chi_tiet_dat_phong ct
               JOIN   dat_phong dp ON dp.id = ct.dat_phong_id
               JOIN   so_khach  sk ON sk.dat_phong_id = dp.id AND sk.status = 'OPEN'
               LEFT JOIN phong  p  ON p.id = ct.phong_id
    WHERE  ct.actual_check_in IS NOT NULL
      AND  ct.actual_check_out IS NULL
      AND  NOT EXISTS (
        SELECT 1 FROM giao_dich_so_khach g
        WHERE g.source_ref_type = 'ROOM_NIGHT'
          AND g.source_ref_id   = ct.id
          AND g.business_date   = p_business_date
    );

    -- 2. Chốt số liệu ngày
    UPDATE ngay_lam_viec n
    SET n.rooms_available = (SELECT COUNT(*) FROM phong WHERE service_status = 'IN_SERVICE'),
        n.rooms_sold      = (SELECT COUNT(*) FROM chi_tiet_dat_phong ct
                             WHERE ct.actual_check_in IS NOT NULL
                               AND ct.actual_check_out IS NULL),
        n.room_revenue    = (SELECT COALESCE(SUM(signed_amount),0) FROM giao_dich_so_khach
                             WHERE business_date = p_business_date AND transaction_type = 'ROOM'),
        n.fnb_revenue     = (SELECT COALESCE(SUM(signed_amount),0) FROM giao_dich_so_khach
                             WHERE business_date = p_business_date AND transaction_type = 'FNB'),
        n.tour_revenue    = (SELECT COALESCE(SUM(signed_amount),0) FROM giao_dich_so_khach
                             WHERE business_date = p_business_date AND transaction_type = 'TOUR'),
        n.status          = 'CLOSED',
        n.closed_at       = NOW(),
        n.closed_by       = p_user_id
    WHERE n.business_date = p_business_date;

    UPDATE ngay_lam_viec
    SET occupancy_rate = IF(rooms_available = 0, 0,
                            ROUND(rooms_sold * 100.0 / rooms_available, 2))
    WHERE business_date = p_business_date;

    -- 3. Mở ngày làm việc kế tiếp
    INSERT IGNORE INTO ngay_lam_viec (business_date)
    VALUES (p_business_date + INTERVAL 1 DAY);
END$$

-- ---------------------------------------------------------------------
-- Ẩn danh hóa khách (UC05) — xóa dữ liệu định danh nhưng giữ nguyên
-- bản ghi tài chính để tuân thủ nghĩa vụ lưu chứng từ kế toán.
-- ---------------------------------------------------------------------
CREATE PROCEDURE sp_an_danh_hoa_khach(
    IN p_nguoi_dung_id CHAR(36)
)
BEGIN
    DECLARE v_open_balance DECIMAL(15,2);

    SELECT COALESCE(SUM(v.balance), 0) INTO v_open_balance
    FROM   v_so_du_folio v
               JOIN   dat_phong dp ON dp.id = v.dat_phong_id
    WHERE  dp.nguoi_dung_id = p_nguoi_dung_id AND v.status = 'OPEN';

    IF v_open_balance <> 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Khong the an danh hoa khi con folio chua tat toan.';
    END IF;

    DELETE FROM ho_so_khach WHERE nguoi_dung_id = p_nguoi_dung_id;

    UPDATE nguoi_dung
    SET email          = CONCAT('anonymized+', id, '@invalid.local'),
        password_hash  = '!',
        full_name      = 'Khach da an danh',
        phone          = NULL,
        status         = 'ANONYMIZED',
        anonymized_at  = NOW()
    WHERE id = p_nguoi_dung_id;
END$$

DELIMITER ;


-- =====================================================================
-- DỮ LIỆU NỀN
-- =====================================================================

INSERT INTO vai_tro (code, name, description) VALUES
                                                  ('GUEST',        'Khách hàng',       'Đặt phòng, gọi món, đặt tour, xem hóa đơn'),
                                                  ('RECEPTIONIST', 'Lễ tân',           'Check-in/out, trạng thái phòng, hóa đơn hợp nhất'),
                                                  ('FNB_STAFF',    'Nhân viên nhà hàng','Xử lý KOT, cập nhật trạng thái đơn món'),
                                                  ('TOUR_GUIDE',   'Hướng dẫn viên',   'Xem manifest tour được phân công'),
                                                  ('MANAGER',      'Quản lý',          'Dashboard công suất, doanh thu, xuất báo cáo'),
                                                  ('ADMIN',        'Quản trị hệ thống','Quản lý tài khoản, phân quyền, dữ liệu nền');

INSERT INTO nhom_mon_an (name, sort_order) VALUES
                                               ('Khai vị', 1), ('Món chính', 2), ('Tráng miệng', 3), ('Đồ uống', 4);

-- Ví dụ khởi tạo tồn kho 90 ngày kể từ hôm nay:
-- CALL sp_khoi_tao_ton_kho(CURDATE(), CURDATE() + INTERVAL 90 DAY);