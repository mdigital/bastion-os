import { useState } from 'react';
import { KnowledgeBaseClients } from './KnowledgeBaseClients';
import { ClientKnowledgeBase } from './ClientKnowledgeBase';

interface KnowledgeBaseProps {
  onBack: () => void;
}

export function KnowledgeBase({ onBack }: KnowledgeBaseProps) {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string>('');

  const handleSelectClient = (clientId: string) => {
    // Map client IDs to names - in production this would come from a database
    const clientNames: { [key: string]: string } = {
      '1': 'Geely Group',
      '2': 'Acme Corporation',
      '3': 'TechStart Inc',
      '4': 'GreenLife Foods',
      '5': 'NordEast Group',
      '6': 'Volvo'
    };
    
    setSelectedClient(clientId);
    setClientName(clientNames[clientId] || 'Client');
  };

  const handleBackToClients = () => {
    setSelectedClient(null);
    setClientName('');
  };

  if (selectedClient) {
    return (
      <ClientKnowledgeBase
        clientId={selectedClient}
        clientName={clientName}
        onBack={handleBackToClients}
      />
    );
  }

  return <KnowledgeBaseClients onSelectClient={handleSelectClient} />;
}
