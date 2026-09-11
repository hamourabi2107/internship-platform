package tn.esprit.companyservice.service;

import org.springframework.stereotype.Service;
import tn.esprit.companyservice.entity.Supervisor;
import tn.esprit.companyservice.repository.SupervisorRepository;

import java.util.List;
import java.util.Optional;

@Service
public class SupervisorService {

    private final SupervisorRepository supervisorRepository;

    public SupervisorService(SupervisorRepository supervisorRepository) {
        this.supervisorRepository = supervisorRepository;
    }

    public List<Supervisor> getAllSupervisors() {
        return supervisorRepository.findAll();
    }

    public Optional<Supervisor> getSupervisorById(Long id) {
        return supervisorRepository.findById(id);
    }

    public List<Supervisor> getSupervisorsByCompany(Long companyId) {
        return supervisorRepository.findByCompanyId(companyId);
    }

    public Supervisor createSupervisor(Supervisor supervisor) {
        return supervisorRepository.save(supervisor);
    }

    public Optional<Supervisor> updateSupervisor(Long id, Supervisor supervisor) {
        return supervisorRepository.findById(id)
                .map(existingSupervisor -> {
                    existingSupervisor.setFirstName(supervisor.getFirstName());
                    existingSupervisor.setLastName(supervisor.getLastName());
                    existingSupervisor.setEmail(supervisor.getEmail());
                    existingSupervisor.setPhone(supervisor.getPhone());
                    existingSupervisor.setCompanyId(supervisor.getCompanyId());
                    return supervisorRepository.save(existingSupervisor);
                });
    }

    public boolean deleteSupervisor(Long id) {
        if (!supervisorRepository.existsById(id)) {
            return false;
        }

        supervisorRepository.deleteById(id);
        return true;
    }
}