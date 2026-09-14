package tn.esprit.companyservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.companyservice.entity.TaskApproval;
import tn.esprit.companyservice.repository.TaskApprovalRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskApprovalServiceTest {

    @Mock
    private TaskApprovalRepository taskApprovalRepository;

    @InjectMocks
    private TaskApprovalService taskApprovalService;

    private TaskApproval taskApproval;

    @BeforeEach
    void setUp() {
        taskApproval = new TaskApproval(1L, 2L, "Implement REST endpoints", "PENDING", "In review");
        taskApproval.setId(1L);
    }

    @Test
    void testGetAllTaskApprovals() {
        when(taskApprovalRepository.findAll()).thenReturn(Arrays.asList(taskApproval));

        List<TaskApproval> list = taskApprovalService.getAllTaskApprovals();

        assertEquals(1, list.size());
        assertEquals("Implement REST endpoints", list.get(0).getTaskDescription());
    }

    @Test
    void testGetTaskApprovalById() {
        when(taskApprovalRepository.findById(1L)).thenReturn(Optional.of(taskApproval));

        Optional<TaskApproval> found = taskApprovalService.getTaskApprovalById(1L);

        assertTrue(found.isPresent());
        assertEquals("PENDING", found.get().getStatus());
    }

    @Test
    void testCreateTaskApproval() {
        when(taskApprovalRepository.save(any(TaskApproval.class))).thenReturn(taskApproval);

        TaskApproval created = taskApprovalService.createTaskApproval(taskApproval);

        assertNotNull(created);
        assertEquals("PENDING", created.getStatus());
    }

    @Test
    void testUpdateTaskApproval() {
        TaskApproval update = new TaskApproval(1L, 2L, "Implement REST endpoints", "APPROVED", "Well done");
        when(taskApprovalRepository.findById(1L)).thenReturn(Optional.of(taskApproval));
        when(taskApprovalRepository.save(any(TaskApproval.class))).thenReturn(taskApproval);

        Optional<TaskApproval> result = taskApprovalService.updateTaskApproval(1L, update);

        assertTrue(result.isPresent());
        assertEquals("APPROVED", taskApproval.getStatus());
        assertEquals("Well done", taskApproval.getComment());
    }

    @Test
    void testDeleteTaskApprovalFound() {
        when(taskApprovalRepository.existsById(1L)).thenReturn(true);
        doNothing().when(taskApprovalRepository).deleteById(1L);

        boolean deleted = taskApprovalService.deleteTaskApproval(1L);

        assertTrue(deleted);
        verify(taskApprovalRepository, times(1)).deleteById(1L);
    }

    @Test
    void testDeleteTaskApprovalNotFound() {
        when(taskApprovalRepository.existsById(99L)).thenReturn(false);

        boolean deleted = taskApprovalService.deleteTaskApproval(99L);

        assertFalse(deleted);
        verify(taskApprovalRepository, never()).deleteById(anyLong());
    }
}
