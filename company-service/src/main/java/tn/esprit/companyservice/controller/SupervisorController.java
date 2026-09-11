package tn.esprit.companyservice.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import tn.esprit.companyservice.entity.Supervisor;
import tn.esprit.companyservice.service.SupervisorService;

import java.util.List;

@RestController
@RequestMapping("/supervisors")
public class SupervisorController {

    private final SupervisorService supervisorService;

    public SupervisorController(SupervisorService supervisorService) {
        this.supervisorService = supervisorService;
    }

    @GetMapping
    public ResponseEntity<List<Supervisor>> getAllSupervisors() {
        return ResponseEntity.ok(supervisorService.getAllSupervisors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Supervisor> getSupervisorById(
            @PathVariable Long id) {

        return supervisorService.getSupervisorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<Supervisor>> getByCompany(
            @PathVariable Long companyId) {

        return ResponseEntity.ok(
                supervisorService.getSupervisorsByCompany(companyId)
        );
    }

    @PostMapping
    public ResponseEntity<Supervisor> createSupervisor(
            @Valid @RequestBody Supervisor supervisor) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(supervisorService.createSupervisor(supervisor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Supervisor> updateSupervisor(
            @PathVariable Long id,
            @Valid @RequestBody Supervisor supervisor) {

        return supervisorService.updateSupervisor(id, supervisor)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupervisor(
            @PathVariable Long id) {

        if (!supervisorService.deleteSupervisor(id)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}