package tn.esprit.studentservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.studentservice.entity.Student;
import tn.esprit.studentservice.repository.StudentRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private StudentService studentService;

    private Student student;

    @BeforeEach
    void setUp() {
        student = new Student("John", "Doe", "john.doe@esprit.tn", "12345678");
        student.setId(1L);
    }

    @Test
    void testGetAllStudents() {
        when(studentRepository.findAll()).thenReturn(Arrays.asList(student));

        List<Student> students = studentService.getAllStudents();

        assertNotNull(students);
        assertEquals(1, students.size());
        assertEquals("John", students.get(0).getFirstName());
        verify(studentRepository, times(1)).findAll();
    }

    @Test
    void testGetStudentById() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        Optional<Student> found = studentService.getStudentById(1L);

        assertTrue(found.isPresent());
        assertEquals("Doe", found.get().getLastName());
        verify(studentRepository, times(1)).findById(1L);
    }

    @Test
    void testCreateStudent() {
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        Student created = studentService.createStudent(student);

        assertNotNull(created);
        assertEquals("john.doe@esprit.tn", created.getEmail());
        verify(studentRepository, times(1)).save(student);
    }

    @Test
    void testUpdateStudent() {
        Student updatedDetails = new Student("John", "Smith", "john.smith@esprit.tn", "87654321");
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        Optional<Student> result = studentService.updateStudent(1L, updatedDetails);

        assertTrue(result.isPresent());
        assertEquals("Smith", student.getLastName());
        assertEquals("87654321", student.getPhone());
        verify(studentRepository, times(1)).save(student);
    }

    @Test
    void testDeleteStudentExisting() {
        when(studentRepository.existsById(1L)).thenReturn(true);
        doNothing().when(studentRepository).deleteById(1L);

        boolean deleted = studentService.deleteStudent(1L);

        assertTrue(deleted);
        verify(studentRepository, times(1)).deleteById(1L);
    }

    @Test
    void testDeleteStudentNotFound() {
        when(studentRepository.existsById(99L)).thenReturn(false);

        boolean deleted = studentService.deleteStudent(99L);

        assertFalse(deleted);
        verify(studentRepository, never()).deleteById(anyLong());
    }
}
