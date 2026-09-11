package tn.esprit.internshipservice.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import tn.esprit.internshipservice.entity.Internship;
import tn.esprit.internshipservice.service.InternshipService;

import java.util.List;

@RestController
@RequestMapping("/internships")
public class InternshipController {

    private final InternshipService internshipService;

    public InternshipController(InternshipService internshipService) {
        this.internshipService = internshipService;
    }

    @GetMapping
    public ResponseEntity<List<Internship>> getAllInternships() {
        return ResponseEntity.ok(internshipService.getAllInternships());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Internship> getInternshipById(
            @PathVariable Long id) {

        return internshipService.getInternshipById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Internship> createInternship(
            @Valid @RequestBody Internship internship) {

        Internship createdInternship =
                internshipService.createInternship(internship);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdInternship);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Internship> updateInternship(
            @PathVariable Long id,
            @Valid @RequestBody Internship internship) {

        return internshipService.updateInternship(id, internship)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInternship(
            @PathVariable Long id) {

        if (!internshipService.deleteInternship(id)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Internship>> getByStudent(
            @PathVariable Long studentId) {

        return ResponseEntity.ok(
                internshipService.getInternshipsByStudent(studentId)
        );
    }

    @GetMapping("/company/{company}")
    public ResponseEntity<List<Internship>> getByCompany(
            @PathVariable String company) {

        return ResponseEntity.ok(
                internshipService.getInternshipsByCompany(company)
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Internship>> getByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                internshipService.getInternshipsByStatus(status)
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(
            IllegalArgumentException ex) {

        return ResponseEntity
                .badRequest()
                .body(ex.getMessage());
    }
}