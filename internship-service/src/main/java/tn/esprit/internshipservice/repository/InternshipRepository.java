package tn.esprit.internshipservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.internshipservice.entity.Internship;

import java.util.List;

public interface InternshipRepository extends JpaRepository<Internship, Long> {

    List<Internship> findByStudentId(Long studentId);

    List<Internship> findByCompany(String company);

    List<Internship> findByStatus(String status);
}