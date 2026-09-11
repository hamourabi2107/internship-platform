package tn.esprit.internshipservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class InternshipServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(InternshipServiceApplication.class, args);
    }
}