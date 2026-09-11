package tn.esprit.companyservice.service;

import org.springframework.stereotype.Service;
import tn.esprit.companyservice.entity.TaskApproval;
import tn.esprit.companyservice.repository.TaskApprovalRepository;

import java.util.List;
import java.util.Optional;

@Service
public class TaskApprovalService {

    private final TaskApprovalRepository taskApprovalRepository;

    public TaskApprovalService(
            TaskApprovalRepository taskApprovalRepository) {
        this.taskApprovalRepository = taskApprovalRepository;
    }

    public List<TaskApproval> getAllTaskApprovals() {
        return taskApprovalRepository.findAll();
    }

    public Optional<TaskApproval> getTaskApprovalById(Long id) {
        return taskApprovalRepository.findById(id);
    }

    public List<TaskApproval> getByInternship(Long internshipId) {
        return taskApprovalRepository.findByInternshipId(internshipId);
    }

    public List<TaskApproval> getBySupervisor(Long supervisorId) {
        return taskApprovalRepository.findBySupervisorId(supervisorId);
    }

    public TaskApproval createTaskApproval(TaskApproval taskApproval) {
        return taskApprovalRepository.save(taskApproval);
    }

    public Optional<TaskApproval> updateTaskApproval(
            Long id,
            TaskApproval taskApproval) {

        return taskApprovalRepository.findById(id)
                .map(existingTaskApproval -> {
                    existingTaskApproval.setInternshipId(
                            taskApproval.getInternshipId());
                    existingTaskApproval.setSupervisorId(
                            taskApproval.getSupervisorId());
                    existingTaskApproval.setTaskDescription(
                            taskApproval.getTaskDescription());
                    existingTaskApproval.setStatus(
                            taskApproval.getStatus());
                    existingTaskApproval.setComment(
                            taskApproval.getComment());

                    return taskApprovalRepository.save(
                            existingTaskApproval);
                });
    }

    public boolean deleteTaskApproval(Long id) {

        if (!taskApprovalRepository.existsById(id)) {
            return false;
        }

        taskApprovalRepository.deleteById(id);
        return true;
    }
}