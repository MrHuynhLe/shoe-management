package com.vn.backend.repository;
import java.util.List;
import com.vn.backend.entity.Attribute;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttributeRepository extends JpaRepository<Attribute, Long> {

    @EntityGraph(attributePaths = {"attributeValues"})
    List<Attribute> findAll();

}