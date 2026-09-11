package tn.esprit.companyservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.companyservice.entity.Supervisor;

import java.util.List;

public interface SupervisorRepository extends JpaRepository<Supervisor, Long> {

    List<Supervisor> findByCompanyId(Long companyId);
}