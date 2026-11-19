import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SupportTicketList from '../../screens/support/SupportTicketList';
import CreateTicket from '../../screens/support/CreateTicket';
import TicketDetail from '../../screens/support/TicketDetail';
import TicketSuccess from '../../screens/support/TicketSuccess';

export default function SupportWrapper() {
  const navigate = useNavigate();
  const [view, setView] = useState('list'); // 'list' | 'create' | 'success' | 'detail'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [createdTicket, setCreatedTicket] = useState(null);

  const handleBack = () => {
    if (view === 'create' || view === 'detail' || view === 'success') {
      setView('list');
      setSelectedTicket(null);
      setCreatedTicket(null);
    } else {
      navigate(-1);
    }
  };

  const handleCreateTicket = () => {
    setView('create');
  };

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setView('detail');
  };

  const handleTicketSubmitted = (ticket) => {
    setCreatedTicket(ticket);
    setView('success');
  };

  if (view === 'success') {
    return (
      <div className="max-w-2xl mx-auto py-2">
        <TicketSuccess
          ticketData={createdTicket}
          onBack={handleBack}
          onViewTicket={() => {
            setSelectedTicket(createdTicket);
            setView('detail');
          }}
        />
      </div>
    );
  }

  if (view === 'create') {
    return (
      <div className="max-w-2xl mx-auto py-2">
        <CreateTicket onBack={handleBack} onSubmit={handleTicketSubmitted} />
      </div>
    );
  }

  if (view === 'detail' && selectedTicket) {
    return (
      <div className="max-w-2xl mx-auto py-2">
        <TicketDetail ticket={selectedTicket} onBack={handleBack} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-2">
      <SupportTicketList
        onBack={() => navigate(-1)}
        onCreateTicket={handleCreateTicket}
        onSelectTicket={handleSelectTicket}
      />
    </div>
  );
}
