package tn.esprit.companyservice.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import tn.esprit.companyservice.entity.TaskApproval;
import tn.esprit.companyservice.service.TaskApprovalService;

import java.util.List;

@RestController
@RequestMapping("/task-approvals")
public class TaskApprovalController {

    private final TaskApprovalService taskApprovalService;

    public TaskApprovalController(
            TaskApprovalService taskApprovalService) {
        this.taskApprovalService = taskApprovalService;
    }

    @GetMapping
    public ResponseEntity<List<TaskApproval>> getAllTaskApprovals() {
        return ResponseEntity.ok(
                taskApprovalService.getAllTaskApprovals()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskApproval> getTaskApprovalById(
            @PathVariable Long id) {

        return taskApprovalService.getTaskApprovalById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/internship/{internshipId}")
    public ResponseEntity<List<TaskApproval>> getByInternship(
            @PathVariable Long internshipId) {

        return ResponseEntity.ok(
                taskApprovalService.getByInternship(internshipId)
        );
    }

    @GetMapping("/supervisor/{supervisorId}")
    public ResponseEntity<List<TaskApproval>> getBySupervisor(
            @PathVariable Long supervisorId) {

        return ResponseEntity.ok(
                taskApprovalService.getBySupervisor(supervisorId)
        );
    }

    @PostMapping
    public ResponseEntity<TaskApproval> createTaskApproval(
            @Valid @RequestBody TaskApproval taskApproval) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        taskApprovalService.createTaskApproval(
                                taskApproval)
                );
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskApproval> updateTaskApproval(
            @PathVariable Long id,
            @Valid @RequestBody TaskApproval taskApproval) {

        return taskApprovalService.updateTaskApproval(id, taskApproval)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTaskApproval(
            @PathVariable Long id) {

        if (!taskApprovalService.deleteTaskApproval(id)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}