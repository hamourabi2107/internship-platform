package tn.esprit.internshipservice.service;

import org.springframework.stereotype.Service;
import tn.esprit.internshipservice.entity.Internship;
import tn.esprit.internshipservice.repository.InternshipRepository;

import java.util.List;
import java.util.Optional;

@Service
public class InternshipService {

    private final InternshipRepository internshipRepository;

    public InternshipService(InternshipRepository internshipRepository) {
        this.internshipRepository = internshipRepository;
    }

    public List<Internship> getAllInternships() {
        return internshipRepository.findAll();
    }

    public Optional<Internship> getInternshipById(Long id) {
        return internshipRepository.findById(id);
    }

    public Internship createInternship(Internship internship) {

        validateInternship(internship);

        return internshipRepository.save(internship);
    }

    public Optional<Internship> updateInternship(
            Long id,
            Internship updatedInternship) {

        return internshipRepository.findById(id)
                .map(existingInternship -> {

                    validateInternship(updatedInternship);

                    existingInternship.setTitle(updatedInternship.getTitle());
                    existingInternship.setCompany(updatedInternship.getCompany());
                    existingInternship.setDescription(updatedInternship.getDescription());
                    existingInternship.setStartDate(updatedInternship.getStartDate());
                    existingInternship.setEndDate(updatedInternship.getEndDate());
                    existingInternship.setStudentId(updatedInternship.getStudentId());
                    existingInternship.setStatus(updatedInternship.getStatus());

                    return internshipRepository.save(existingInternship);
                });
    }

    public boolean deleteInternship(Long id) {

        if (!internshipRepository.existsById(id)) {
            return false;
        }

        internshipRepository.deleteById(id);
        return true;
    }

    public List<Internship> getInternshipsByStudent(Long studentId) {
        return internshipRepository.findByStudentId(studentId);
    }

    public List<Internship> getInternshipsByCompany(String company) {
        return internshipRepository.findByCompany(company);
    }

    public List<Internship> getInternshipsByStatus(String status) {
        return internshipRepository.findByStatus(status);
    }

    private void validateInternship(Internship internship) {

        if (internship.getStartDate().isAfter(internship.getEndDate())) {
            throw new IllegalArgumentException(
                    "Start date must be before end date"
            );
        }

        if (!internship.getStatus().equalsIgnoreCase("ACTIVE")
                && !internship.getStatus().equalsIgnoreCase("COMPLETED")
                && !internship.getStatus().equalsIgnoreCase("CANCELLED")) {

            throw new IllegalArgumentException(
                    "Status must be ACTIVE, COMPLETED or CANCELLED"
            );
        }
    }
}