package tn.esprit.companyservice.service;

import org.springframework.stereotype.Service;
import tn.esprit.companyservice.entity.InternshipAcceptance;
import tn.esprit.companyservice.repository.InternshipAcceptanceRepository;

import java.util.List;
import java.util.Optional;

@Service
public class AcceptanceService {

    private final InternshipAcceptanceRepository acceptanceRepository;

    public AcceptanceService(
            InternshipAcceptanceRepository acceptanceRepository) {
        this.acceptanceRepository = acceptanceRepository;
    }

    public List<InternshipAcceptance> getAllAcceptances() {
        return acceptanceRepository.findAll();
    }

    public Optional<InternshipAcceptance> getAcceptanceById(Long id) {
        return acceptanceRepository.findById(id);
    }

    public List<InternshipAcceptance> getByCompany(Long companyId) {
        return acceptanceRepository.findByCompanyId(companyId);
    }

    public List<InternshipAcceptance> getByInternship(Long internshipId) {
        return acceptanceRepository.findByInternshipId(internshipId);
    }

    public InternshipAcceptance createAcceptance(
            InternshipAcceptance acceptance) {

        return acceptanceRepository.save(acceptance);
    }

    public Optional<InternshipAcceptance> updateAcceptance(
            Long id,
            InternshipAcceptance acceptance) {

        return acceptanceRepository.findById(id)
                .map(existingAcceptance -> {
                    existingAcceptance.setInternshipId(
                            acceptance.getInternshipId());
                    existingAcceptance.setCompanyId(
                            acceptance.getCompanyId());
                    existingAcceptance.setStatus(
                            acceptance.getStatus());
                    existingAcceptance.setReason(
                            acceptance.getReason());

                    return acceptanceRepository.save(existingAcceptance);
                });
    }

    public boolean deleteAcceptance(Long id) {

        if (!acceptanceRepository.existsById(id)) {
            return false;
        }

        acceptanceRepository.deleteById(id);
        return true;
    }
}