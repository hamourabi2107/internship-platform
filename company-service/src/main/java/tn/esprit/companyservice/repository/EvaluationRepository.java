package tn.esprit.companyservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.companyservice.entity.Evaluation;

import java.util.List;

public interface EvaluationRepository
        extends JpaRepository<Evaluation, Long> {

    List<Evaluation> findByInternshipId(Long internshipId);

    List<Evaluation> findBySupervisorId(Long supervisorId);
}