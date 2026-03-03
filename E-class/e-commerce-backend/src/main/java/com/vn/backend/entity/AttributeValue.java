package com.vn.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "attribute_values")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttributeValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attribute_id", nullable = false)
    private Attribute attribute;

    @Column(nullable = false, length = 255)
    private String value;

    @Column(name = "is_active")
    private Boolean isActive = true;
    @PrePersist
    public void prePersist() {
        if (isActive == null) isActive = true; // ✅ chặn NULL khi insert
    }

}
