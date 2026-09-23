package com.freelancer.backend.websocket;

import com.freelancer.backend.dto.MessageDto.MessageResponse;
import com.freelancer.backend.exception.ForbiddenException;
import com.freelancer.backend.service.MessageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.security.Principal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatControllerTest {

    @Mock
    private MessageService messageService;

    @InjectMocks
    private ChatController chatController;

    private Principal principal(String email) {
        return () -> email;
    }

    private ChatController.ChatInbound inbound(String text) {
        ChatController.ChatInbound payload =
                new ChatController.ChatInbound();
        payload.setMessage(text);
        return payload;
    }

    @Test
    void participantMessageIsBroadcast() {
        MessageResponse saved = new MessageResponse();
        saved.setJobId(1L);
        saved.setMessage("hello room");

        when(messageService.sendMessage(
                any(), anyString())).thenReturn(saved);

        MessageResponse result = chatController.chat(
                1L, inbound("hello room"),
                principal("dev@test.com"));

        assertThat(result.getMessage()).isEqualTo("hello room");
        verify(messageService).requireJobParticipant(
                1L, "dev@test.com", false);
    }

    @Test
    void outsiderMessageIsRejected() {
        doThrow(new ForbiddenException("Chat is available only "
                + "to the client and the hired freelancer."))
                .when(messageService).requireJobParticipant(
                        anyLong(), anyString(), anyBoolean());

        assertThatThrownBy(() -> chatController.chat(
                1L, inbound("hi"),
                principal("stranger@test.com")))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void emptyMessageIsRejected() {
        assertThatThrownBy(() -> chatController.chat(
                1L, inbound("  "),
                principal("dev@test.com")))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
