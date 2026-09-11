package tn.esprit.companyservice.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import tn.esprit.companyservice.entity.InternshipAcceptance;
import tn.esprit.companyservice.service.AcceptanceService;

import java.util.List;

@RestController
@RequestMapping("/acceptances")
public class InternshipAcceptanceController {

    private final AcceptanceService acceptanceService;

    public InternshipAcceptanceController(
            AcceptanceService acceptanceService) {
        this.acceptanceService = acceptanceService;
    }

    @GetMapping
    public ResponseEntity<List<InternshipAcceptance>> getAllAcceptances() {
        return ResponseEntity.ok(
                acceptanceService.getAllAcceptances()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<InternshipAcceptance> getAcceptanceById(
            @PathVariable Long id) {

        return acceptanceService.getAcceptanceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<InternshipAcceptance>> getByCompany(
            @PathVariable Long companyId) {

        return ResponseEntity.ok(
                acceptanceService.getByCompany(companyId)
        );
    }

    @GetMapping("/internship/{internshipId}")
    public ResponseEntity<List<InternshipAcceptance>> getByInternship(
            @PathVariable Long internshipId) {

        return ResponseEntity.ok(
                acceptanceService.getByInternship(internshipId)
        );
    }

    @PostMapping
    public ResponseEntity<InternshipAcceptance> createAcceptance(
            @Valid @RequestBody InternshipAcceptance acceptance) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(acceptanceService.createAcceptance(acceptance));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InternshipAcceptance> updateAcceptance(
            @PathVariable Long id,
            @Valid @RequestBody InternshipAcceptance acceptance) {

        return acceptanceService.updateAcceptance(id, acceptance)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAcceptance(
            @PathVariable Long id) {

        if (!acceptanceService.deleteAcceptance(id)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}