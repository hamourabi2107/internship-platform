package tn.esprit.internshipservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tn.esprit.internshipservice.entity.Internship;
import tn.esprit.internshipservice.service.InternshipService;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class InternshipControllerTest {

    private MockMvc mockMvc;

    @Mock
    private InternshipService internshipService;

    @InjectMocks
    private InternshipController internshipController;

    private ObjectMapper objectMapper;

    private Internship internship;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(internshipController).build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        internship = new Internship(
                "Backend Developer Intern",
                "Acme Corp",
                "Developing APIs",
                LocalDate.of(2026, 7, 1),
                LocalDate.of(2026, 12, 31),
                10L,
                "PENDING"
        );
        internship.setId(1L);
    }

    @Test
    void testGetAllInternships() throws Exception {
        when(internshipService.getAllInternships()).thenReturn(Arrays.asList(internship));

        mockMvc.perform(get("/internships"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Backend Developer Intern"))
                .andExpect(jsonPath("$[0].company").value("Acme Corp"));
    }

    @Test
    void testGetInternshipByIdFound() throws Exception {
        when(internshipService.getInternshipById(1L)).thenReturn(Optional.of(internship));

        mockMvc.perform(get("/internships/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.company").value("Acme Corp"));
    }

    @Test
    void testGetInternshipByIdNotFound() throws Exception {
        when(internshipService.getInternshipById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/internships/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testCreateInternship() throws Exception {
        when(internshipService.createInternship(any(Internship.class))).thenReturn(internship);

        mockMvc.perform(post("/internships")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(internship)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.company").value("Acme Corp"));
    }

    @Test
    void testUpdateInternship() throws Exception {
        when(internshipService.updateInternship(eq(1L), any(Internship.class))).thenReturn(Optional.of(internship));

        mockMvc.perform(put("/internships/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(internship)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Backend Developer Intern"));
    }

    @Test
    void testDeleteInternshipFound() throws Exception {
        when(internshipService.deleteInternship(1L)).thenReturn(true);

        mockMvc.perform(delete("/internships/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void testDeleteInternshipNotFound() throws Exception {
        when(internshipService.deleteInternship(999L)).thenReturn(false);

        mockMvc.perform(delete("/internships/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetByStudent() throws Exception {
        when(internshipService.getInternshipsByStudent(10L)).thenReturn(Arrays.asList(internship));

        mockMvc.perform(get("/internships/student/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentId").value(10));
    }

    @Test
    void testGetByCompany() throws Exception {
        when(internshipService.getInternshipsByCompany("Acme Corp")).thenReturn(Arrays.asList(internship));

        mockMvc.perform(get("/internships/company/Acme Corp"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].company").value("Acme Corp"));
    }

    @Test
    void testGetByStatus() throws Exception {
        when(internshipService.getInternshipsByStatus("PENDING")).thenReturn(Arrays.asList(internship));

        mockMvc.perform(get("/internships/status/PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }
}
