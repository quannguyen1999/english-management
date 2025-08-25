package com.eng.controllers;

import com.eng.service.ConversationService;
import com.eng.models.response.ConversationResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConversationControllerTest {

    @Mock
    private ConversationService conversationService;

    @InjectMocks
    private ConversationController conversationController;

    @Test
    void createAIConversation_ShouldReturnConversationResponse() {
        // Arrange
        ConversationResponse expectedResponse = new ConversationResponse();
        when(conversationService.createAIConversation()).thenReturn(expectedResponse);

        // Act
        ResponseEntity<ConversationResponse> response = conversationController.createAIConversation();

        // Assert
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(expectedResponse, response.getBody());
        verify(conversationService, times(1)).createAIConversation();
    }
}
