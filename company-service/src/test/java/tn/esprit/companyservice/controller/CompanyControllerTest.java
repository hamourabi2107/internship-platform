package tn.esprit.companyservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tn.esprit.companyservice.entity.Company;
import tn.esprit.companyservice.service.CompanyService;

import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CompanyControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CompanyService companyService;

    @InjectMocks
    private CompanyController companyController;

    private ObjectMapper objectMapper = new ObjectMapper();

    private Company company;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(companyController).build();
        company = new Company("Alpha Inc", "alpha@company.com", "71998877", "123 Business Ave");
        company.setId(1L);
    }

    @Test
    void testGetAllCompanies() throws Exception {
        when(companyService.getAllCompanies()).thenReturn(Arrays.asList(company));

        mockMvc.perform(get("/companies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Alpha Inc"))
                .andExpect(jsonPath("$[0].phone").value("71998877"));
    }

    @Test
    void testGetCompanyByIdFound() throws Exception {
        when(companyService.getCompanyById(1L)).thenReturn(Optional.of(company));

        mockMvc.perform(get("/companies/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("alpha@company.com"));
    }

    @Test
    void testGetCompanyByIdNotFound() throws Exception {
        when(companyService.getCompanyById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/companies/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testCreateCompany() throws Exception {
        when(companyService.createCompany(any(Company.class))).thenReturn(company);

        mockMvc.perform(post("/companies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(company)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Alpha Inc"));
    }

    @Test
    void testUpdateCompany() throws Exception {
        when(companyService.updateCompany(eq(1L), any(Company.class))).thenReturn(Optional.of(company));

        mockMvc.perform(put("/companies/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(company)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.address").value("123 Business Ave"));
    }

    @Test
    void testDeleteCompanyFound() throws Exception {
        when(companyService.deleteCompany(1L)).thenReturn(true);

        mockMvc.perform(delete("/companies/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void testDeleteCompanyNotFound() throws Exception {
        when(companyService.deleteCompany(999L)).thenReturn(false);

        mockMvc.perform(delete("/companies/999"))
                .andExpect(status().isNotFound());
    }
}
