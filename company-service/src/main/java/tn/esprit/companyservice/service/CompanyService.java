package tn.esprit.companyservice.service;

import org.springframework.stereotype.Service;
import tn.esprit.companyservice.entity.Company;
import tn.esprit.companyservice.repository.CompanyRepository;

import java.util.List;
import java.util.Optional;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    public Optional<Company> getCompanyById(Long id) {
        return companyRepository.findById(id);
    }

    public Company createCompany(Company company) {
        return companyRepository.save(company);
    }

    public Optional<Company> updateCompany(Long id, Company company) {
        return companyRepository.findById(id)
                .map(existingCompany -> {
                    existingCompany.setName(company.getName());
                    existingCompany.setEmail(company.getEmail());
                    existingCompany.setPhone(company.getPhone());
                    existingCompany.setAddress(company.getAddress());
                    return companyRepository.save(existingCompany);
                });
    }

    public boolean deleteCompany(Long id) {
        if (!companyRepository.existsById(id)) {
            return false;
        }

        companyRepository.deleteById(id);
        return true;
    }
}