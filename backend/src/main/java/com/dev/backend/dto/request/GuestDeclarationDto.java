package com.dev.backend.dto.request;

import com.dev.backend.constant.enums.Gender;
import com.dev.backend.constant.enums.IdType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class GuestDeclarationDto {
    @NotBlank(message = "Họ tên khách không được để trống")
    private String fullName;

    @NotNull(message = "Ngày sinh không được để trống")
    private LocalDate dateOfBirth;

    @NotNull(message = "Giới tính không được để trống")
    private Gender gender;

    private IdType idType = IdType.CCCD;

    @NotBlank(message = "Số CCCD/Hộ chiếu không được để trống")
    private String idNumber;

    @NotBlank(message = "Quốc tịch không được để trống")
    private String nationality = "Việt Nam";

    private String permanentAddress;

    private Boolean isPrimaryGuest = false;
}
