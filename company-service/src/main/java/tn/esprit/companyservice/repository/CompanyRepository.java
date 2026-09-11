package tn.esprit.companyservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.companyservice.entity.Company;

public interface CompanyRepository extends JpaRepository<Company, Long> {
}