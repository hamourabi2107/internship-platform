package tn.esprit.internshipservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.internshipservice.entity.Internship;
import tn.esprit.internshipservice.repository.InternshipRepository;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InternshipServiceTest {

    @Mock
    private InternshipRepository internshipRepository;

    @InjectMocks
    private InternshipService internshipService;

    private Internship internship;

    @BeforeEach
    void setUp() {
        internship = new Internship(
                "Software Engineer Intern",
                "Google",
                "Building microservices",
                LocalDate.now(),
                LocalDate.now().plusMonths(6),
                1L,
                "PENDING"
        );
        internship.setId(1L);
    }

    @Test
    void testGetAllInternships() {
        when(internshipRepository.findAll()).thenReturn(Arrays.asList(internship));

        List<Internship> list = internshipService.getAllInternships();

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("Software Engineer Intern", list.get(0).getTitle());
    }

    @Test
    void testGetInternshipById() {
        when(internshipRepository.findById(1L)).thenReturn(Optional.of(internship));

        Optional<Internship> found = internshipService.getInternshipById(1L);

        assertTrue(found.isPresent());
        assertEquals("Google", found.get().getCompany());
    }

    @Test
    void testCreateInternshipSuccess() {
        when(internshipRepository.save(any(Internship.class))).thenReturn(internship);

        Internship created = internshipService.createInternship(internship);

        assertNotNull(created);
        assertEquals("PENDING", created.getStatus());
        verify(internshipRepository, times(1)).save(internship);
    }

    @Test
    void testCreateInternshipInvalidDates() {
        internship.setStartDate(LocalDate.now().plusMonths(2));
        internship.setEndDate(LocalDate.now());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            internshipService.createInternship(internship);
        });

        assertEquals("Start date must be before end date", ex.getMessage());
        verify(internshipRepository, never()).save(any());
    }

    @Test
    void testCreateInternshipInvalidStatus() {
        internship.setStatus("INVALID_STATUS");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            internshipService.createInternship(internship);
        });

        assertTrue(ex.getMessage().contains("Status must be"));
        verify(internshipRepository, never()).save(any());
    }

    @Test
    void testUpdateInternshipSuccess() {
        Internship updated = new Internship(
                "Senior Intern",
                "Google",
                "Updated description",
                LocalDate.now(),
                LocalDate.now().plusMonths(6),
                1L,
                "ACCEPTED"
        );
        when(internshipRepository.findById(1L)).thenReturn(Optional.of(internship));
        when(internshipRepository.save(any(Internship.class))).thenReturn(internship);

        Optional<Internship> result = internshipService.updateInternship(1L, updated);

        assertTrue(result.isPresent());
        assertEquals("Senior Intern", internship.getTitle());
        assertEquals("ACCEPTED", internship.getStatus());
        verify(internshipRepository, times(1)).save(internship);
    }

    @Test
    void testDeleteInternshipFound() {
        when(internshipRepository.existsById(1L)).thenReturn(true);
        doNothing().when(internshipRepository).deleteById(1L);

        boolean deleted = internshipService.deleteInternship(1L);

        assertTrue(deleted);
        verify(internshipRepository, times(1)).deleteById(1L);
    }

    @Test
    void testDeleteInternshipNotFound() {
        when(internshipRepository.existsById(99L)).thenReturn(false);

        boolean deleted = internshipService.deleteInternship(99L);

        assertFalse(deleted);
        verify(internshipRepository, never()).deleteById(anyLong());
    }

    @Test
    void testGetInternshipsByStudent() {
        when(internshipRepository.findByStudentId(1L)).thenReturn(Arrays.asList(internship));

        List<Internship> list = internshipService.getInternshipsByStudent(1L);

        assertEquals(1, list.size());
        assertEquals(1L, list.get(0).getStudentId());
    }

    @Test
    void testGetInternshipsByCompany() {
        when(internshipRepository.findByCompany("Google")).thenReturn(Arrays.asList(internship));

        List<Internship> list = internshipService.getInternshipsByCompany("Google");

        assertEquals(1, list.size());
        assertEquals("Google", list.get(0).getCompany());
    }

    @Test
    void testGetInternshipsByStatus() {
        when(internshipRepository.findByStatus("PENDING")).thenReturn(Arrays.asList(internship));

        List<Internship> list = internshipService.getInternshipsByStatus("PENDING");

        assertEquals(1, list.size());
        assertEquals("PENDING", list.get(0).getStatus());
    }
}
