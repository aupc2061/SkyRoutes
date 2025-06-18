import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

interface Flight {
  id: string;
  itineraries: Array<{
    segments: Array<{
      departure: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      carrierCode: string;
      number: string;
    }>;
  }>;
  price: {
    total: string;
    currency: string;
  };
  airline?: string;
}

export const generateTicketPDF = (flight: Flight, passengerName: string, seatNumber: number) => {
  const doc = new jsPDF();
  const firstSegment = flight.itineraries[0].segments[0];
  const lastSegment = flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1];

  // Set font
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Flight Ticket", 105, 20, { align: "center" });

  // Passenger Information
  doc.setFontSize(12);
  doc.text("Passenger Information", 20, 40);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${passengerName}`, 20, 50);
  doc.text(`Seat: ${seatNumber}`, 20, 60);

  // Flight Information
  doc.setFont("helvetica", "bold");
  doc.text("Flight Information", 20, 80);
  doc.setFont("helvetica", "normal");
  doc.text(`Flight: ${firstSegment.carrierCode} ${firstSegment.number}`, 20, 90);
  doc.text(`From: ${firstSegment.departure.iataCode}`, 20, 100);
  doc.text(`To: ${lastSegment.arrival.iataCode}`, 20, 110);
  doc.text(`Departure: ${format(new Date(firstSegment.departure.at), 'PPpp')}`, 20, 120);
  doc.text(`Arrival: ${format(new Date(lastSegment.arrival.at), 'PPpp')}`, 20, 130);
  if (firstSegment.departure.terminal) {
    doc.text(`Terminal: ${firstSegment.departure.terminal}`, 20, 140);
  }

  // Price Information
  doc.setFont("helvetica", "bold");
  doc.text("Price Information", 20, 160);
  doc.setFont("helvetica", "normal");
  doc.text(`Total: ${flight.price.currency} ${flight.price.total}`, 20, 170);

  // Save the PDF
  const fileName = `ticket_${firstSegment.carrierCode}${firstSegment.number}_${passengerName.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}; 