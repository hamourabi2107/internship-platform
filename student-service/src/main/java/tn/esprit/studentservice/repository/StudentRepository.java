package tn.esprit.studentservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.studentservice.entity.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {
}