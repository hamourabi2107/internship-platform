package tn.esprit.companyservice.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "task_approvals")
public class TaskApproval {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private Long internshipId;

    @NotNull
    private Long supervisorId;

    @NotBlank
    private String taskDescription;

    @NotNull
    @Pattern(
            regexp = "PENDING|APPROVED|REJECTED",
            message = "Status must be PENDING, APPROVED or REJECTED"
    )
    private String status;

    private String comment;

    public TaskApproval() {
    }

    public TaskApproval(Long internshipId,
                        Long supervisorId,
                        String taskDescription,
                        String status,
                        String comment) {
        this.internshipId = internshipId;
        this.supervisorId = supervisorId;
        this.taskDescription = taskDescription;
        this.status = status;
        this.comment = comment;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getInternshipId() {
        return internshipId;
    }

    public void setInternshipId(Long internshipId) {
        this.internshipId = internshipId;
    }

    public Long getSupervisorId() {
        return supervisorId;
    }

    public void setSupervisorId(Long supervisorId) {
        this.supervisorId = supervisorId;
    }

    public String getTaskDescription() {
        return taskDescription;
    }

    public void setTaskDescription(String taskDescription) {
        this.taskDescription = taskDescription;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}