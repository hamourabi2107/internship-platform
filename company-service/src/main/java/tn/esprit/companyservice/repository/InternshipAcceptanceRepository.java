package tn.esprit.companyservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.companyservice.entity.InternshipAcceptance;

import java.util.List;

public interface InternshipAcceptanceRepository
        extends JpaRepository<InternshipAcceptance, Long> {

    List<InternshipAcceptance> findByCompanyId(Long companyId);

    List<InternshipAcceptance> findByInternshipId(Long internshipId);
}