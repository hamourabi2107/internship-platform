package tn.esprit.companyservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.companyservice.entity.Company;
import tn.esprit.companyservice.repository.CompanyRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyServiceTest {

    @Mock
    private CompanyRepository companyRepository;

    @InjectMocks
    private CompanyService companyService;

    private Company company;

    @BeforeEach
    void setUp() {
        company = new Company("Tech Corp", "contact@techcorp.com", "71123456", "Tunis, Tunisia");
        company.setId(1L);
    }

    @Test
    void testGetAllCompanies() {
        when(companyRepository.findAll()).thenReturn(Arrays.asList(company));

        List<Company> list = companyService.getAllCompanies();

        assertEquals(1, list.size());
        assertEquals("Tech Corp", list.get(0).getName());
    }

    @Test
    void testGetCompanyById() {
        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));

        Optional<Company> found = companyService.getCompanyById(1L);

        assertTrue(found.isPresent());
        assertEquals("contact@techcorp.com", found.get().getEmail());
    }

    @Test
    void testCreateCompany() {
        when(companyRepository.save(any(Company.class))).thenReturn(company);

        Company created = companyService.createCompany(company);

        assertNotNull(created);
        assertEquals("Tech Corp", created.getName());
    }

    @Test
    void testUpdateCompany() {
        Company update = new Company("Tech Corp International", "new@techcorp.com", "71123456", "Ariana, Tunisia");
        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(companyRepository.save(any(Company.class))).thenReturn(company);

        Optional<Company> result = companyService.updateCompany(1L, update);

        assertTrue(result.isPresent());
        assertEquals("Tech Corp International", company.getName());
        assertEquals("Ariana, Tunisia", company.getAddress());
    }

    @Test
    void testDeleteCompanyFound() {
        when(companyRepository.existsById(1L)).thenReturn(true);
        doNothing().when(companyRepository).deleteById(1L);

        boolean deleted = companyService.deleteCompany(1L);

        assertTrue(deleted);
        verify(companyRepository, times(1)).deleteById(1L);
    }

    @Test
    void testDeleteCompanyNotFound() {
        when(companyRepository.existsById(99L)).thenReturn(false);

        boolean deleted = companyService.deleteCompany(99L);

        assertFalse(deleted);
        verify(companyRepository, never()).deleteById(anyLong());
    }
}
