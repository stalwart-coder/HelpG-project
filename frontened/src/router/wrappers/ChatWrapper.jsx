import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChatInbox from '../../screens/chat/ChatInbox';
import ChatConversation from '../../screens/chat/ChatConversation';

export default function ChatWrapper() {
  const navigate = useNavigate();
  const { conversationId: paramConvId } = useParams();
  const [selectedConversation, setSelectedConversation] = useState(
    paramConvId ? { _id: paramConvId, id: paramConvId } : null
  );

  const handleBackToInbox = () => {
    setSelectedConversation(null);
  };

  const handleBackToHome = () => {
    navigate(-1);
  };

  if (selectedConversation) {
    return (
      <div className="max-w-3xl mx-auto py-2">
        <ChatConversation
          conversation={selectedConversation}
          onBack={handleBackToInbox}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-2">
      <ChatInbox
        onBack={handleBackToHome}
        onSelectConversation={(conv) => setSelectedConversation(conv)}
      />
    </div>
  );
}

