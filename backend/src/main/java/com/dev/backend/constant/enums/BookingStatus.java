package com.dev.backend.constant.enums;

/** Dùng chung cho dat_phong và dat_tour (hợp nhất 2 ENUM của DB). CHECKED_IN/CHECKED_OUT chỉ dùng cho phòng, COMPLETED chỉ dùng cho tour. */
public enum BookingStatus {
    PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, COMPLETED, CANCELLED, NO_SHOW
}
