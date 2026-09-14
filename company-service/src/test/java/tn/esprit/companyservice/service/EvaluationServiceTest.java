package tn.esprit.companyservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.companyservice.entity.Evaluation;
import tn.esprit.companyservice.repository.EvaluationRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EvaluationServiceTest {

    @Mock
    private EvaluationRepository evaluationRepository;

    @InjectMocks
    private EvaluationService evaluationService;

    private Evaluation evaluation;

    @BeforeEach
    void setUp() {
        evaluation = new Evaluation(
                1L,
                2L,
                15.0,
                18.0,
                12.0,
                "Good technical performance",
                "Needs more initiative"
        );
        evaluation.setId(1L);
    }

    @Test
    void testCreateEvaluationCalculatesOverallGrade() {
        when(evaluationRepository.save(any(Evaluation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Evaluation created = evaluationService.createEvaluation(evaluation);

        assertNotNull(created);
        // (15 + 18 + 12) / 3 = 45 / 3 = 15.0
        assertEquals(15.0, created.getOverallGrade());
        verify(evaluationRepository, times(1)).save(evaluation);
    }

    @Test
    void testGetAllEvaluations() {
        when(evaluationRepository.findAll()).thenReturn(Arrays.asList(evaluation));

        List<Evaluation> all = evaluationService.getAllEvaluations();

        assertEquals(1, all.size());
        assertEquals("Good technical performance", all.get(0).getAppreciation());
    }

    @Test
    void testGetEvaluationById() {
        when(evaluationRepository.findById(1L)).thenReturn(Optional.of(evaluation));

        Optional<Evaluation> found = evaluationService.getEvaluationById(1L);

        assertTrue(found.isPresent());
        assertEquals(1L, found.get().getInternshipId());
    }

    @Test
    void testGetByInternship() {
        when(evaluationRepository.findByInternshipId(1L)).thenReturn(Arrays.asList(evaluation));

        List<Evaluation> list = evaluationService.getByInternship(1L);

        assertEquals(1, list.size());
    }

    @Test
    void testGetBySupervisor() {
        when(evaluationRepository.findBySupervisorId(2L)).thenReturn(Arrays.asList(evaluation));

        List<Evaluation> list = evaluationService.getBySupervisor(2L);

        assertEquals(1, list.size());
    }

    @Test
    void testUpdateEvaluationRecalculatesGrade() {
        Evaluation updateData = new Evaluation(
                1L,
                2L,
                18.0,
                18.0,
                18.0,
                "Excellent",
                "Keep it up"
        );
        when(evaluationRepository.findById(1L)).thenReturn(Optional.of(evaluation));
        when(evaluationRepository.save(any(Evaluation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<Evaluation> updated = evaluationService.updateEvaluation(1L, updateData);

        assertTrue(updated.isPresent());
        // (18 + 18 + 18) / 3 = 18.0
        assertEquals(18.0, updated.get().getOverallGrade());
        assertEquals("Excellent", updated.get().getAppreciation());
    }

    @Test
    void testDeleteEvaluationFound() {
        when(evaluationRepository.existsById(1L)).thenReturn(true);
        doNothing().when(evaluationRepository).deleteById(1L);

        boolean deleted = evaluationService.deleteEvaluation(1L);

        assertTrue(deleted);
        verify(evaluationRepository, times(1)).deleteById(1L);
    }

    @Test
    void testDeleteEvaluationNotFound() {
        when(evaluationRepository.existsById(99L)).thenReturn(false);

        boolean deleted = evaluationService.deleteEvaluation(99L);

        assertFalse(deleted);
        verify(evaluationRepository, never()).deleteById(anyLong());
    }
}
