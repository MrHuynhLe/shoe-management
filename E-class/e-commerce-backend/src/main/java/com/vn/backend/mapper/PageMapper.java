package com.vn.backend.mapper;

import com.vn.backend.dto.response.PageResponse;
import org.springframework.data.domain.Page;

import java.util.function.Function;

public class PageMapper {

    public static <E, D> PageResponse<D> toPageResponse(
            Page<E> page,
            Function<E, D> mapper
    ) {
        return new PageResponse<>(
                page.getContent().stream().map(mapper).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }
}
