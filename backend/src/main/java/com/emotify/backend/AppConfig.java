package com.emotify.backend;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class AppConfig {

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();

        // Allow RestTemplate to parse text/javascript responses (iTunes API)
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        List<MediaType> supportedMediaTypes = new ArrayList<>(converter.getSupportedMediaTypes());
        supportedMediaTypes.add(new MediaType("text", "javascript"));
        supportedMediaTypes.add(new MediaType("text", "plain"));
        converter.setSupportedMediaTypes(supportedMediaTypes);

        restTemplate.getMessageConverters().add(0, converter);
        return restTemplate;
    }
}