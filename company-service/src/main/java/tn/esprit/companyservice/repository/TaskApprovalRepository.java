package tn.esprit.companyservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.companyservice.entity.TaskApproval;

import java.util.List;

public interface TaskApprovalRepository
        extends JpaRepository<TaskApproval, Long> {

    List<TaskApproval> findByInternshipId(Long internshipId);

    List<TaskApproval> findBySupervisorId(Long supervisorId);
}