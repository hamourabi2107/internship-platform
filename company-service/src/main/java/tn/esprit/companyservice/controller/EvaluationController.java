package tn.esprit.companyservice.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import tn.esprit.companyservice.entity.Evaluation;
import tn.esprit.companyservice.service.EvaluationService;

import java.util.List;

@RestController
@RequestMapping("/evaluations")
public class EvaluationController {

    private final EvaluationService evaluationService;

    public EvaluationController(EvaluationService evaluationService) {
        this.evaluationService = evaluationService;
    }

    @GetMapping
    public ResponseEntity<List<Evaluation>> getAllEvaluations() {
        return ResponseEntity.ok(
                evaluationService.getAllEvaluations()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Evaluation> getEvaluationById(
            @PathVariable Long id) {

        return evaluationService.getEvaluationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/internship/{internshipId}")
    public ResponseEntity<List<Evaluation>> getByInternship(
            @PathVariable Long internshipId) {

        return ResponseEntity.ok(
                evaluationService.getByInternship(internshipId)
        );
    }

    @GetMapping("/supervisor/{supervisorId}")
    public ResponseEntity<List<Evaluation>> getBySupervisor(
            @PathVariable Long supervisorId) {

        return ResponseEntity.ok(
                evaluationService.getBySupervisor(supervisorId)
        );
    }

    @PostMapping
    public ResponseEntity<Evaluation> createEvaluation(
            @Valid @RequestBody Evaluation evaluation) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(evaluationService.createEvaluation(evaluation));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Evaluation> updateEvaluation(
            @PathVariable Long id,
            @Valid @RequestBody Evaluation evaluation) {

        return evaluationService.updateEvaluation(id, evaluation)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvaluation(
            @PathVariable Long id) {

        if (!evaluationService.deleteEvaluation(id)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}