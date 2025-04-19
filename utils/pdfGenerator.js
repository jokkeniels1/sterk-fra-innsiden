import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = (content, title, userData = null) => {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  // Constants for layout
  const margin = 20;
  const pageWidth = 190;
  const maxWidth = pageWidth - (margin * 2);
  const lineHeight = 7;
  const sectionSpacing = 15;
  
  // Function to add text with proper wrapping
  const addWrappedText = (text, y, options = {}) => {
    const {
      fontSize = 12,
      color = [0, 0, 0],
      align = 'left',
      isBold = false
    } = options;
    
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    if (isBold) doc.setFont('helvetica', 'bold');
    else doc.setFont('helvetica', 'normal');
    
    const splitText = doc.splitTextToSize(text, maxWidth);
    doc.text(splitText, margin, y, { align });
    return y + (splitText.length * (fontSize * 1.2));
  };
  
  // Function to add a section header
  const addSectionHeader = (text, y) => {
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185);
    doc.setFont('helvetica', 'bold');
    y = addWrappedText(text, y, { fontSize: 16, color: [41, 128, 185], isBold: true });
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.3);
    doc.line(margin, y - 5, margin + maxWidth, y - 5);
    return y + 10;
  };
  
  // Function to check if we need a new page
  const checkNewPage = (y) => {
    if (y > 250) {
      doc.addPage();
      return 90; // Reset y position for new page
    }
    return y;
  };
  
  // Function to add a data row
  const addDataRow = (label, value, y) => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    const labelWidth = 60;
    doc.text(label, margin, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const valueText = doc.splitTextToSize(value, maxWidth - labelWidth - 10);
    doc.text(valueText, margin + labelWidth + 5, y);
    
    return y + (valueText.length * lineHeight) + 5;
  };
  
  // Add title
  doc.setFontSize(24);
  doc.setTextColor(41, 128, 185);
  doc.setFont('helvetica', 'bold');
  let yPosition = addWrappedText(title, 40, { fontSize: 24, color: [41, 128, 185], isBold: true });
  
  // Add horizontal line
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition + 5, margin + maxWidth, yPosition + 5);
  yPosition += 15;
  
  // Add user data if provided
  if (userData) {
    yPosition = checkNewPage(yPosition);
    yPosition = addSectionHeader('Brukerdata', yPosition);
    
    const userInfo = [
      ['Navn', userData.navn || 'Ikke spesifisert'],
      ['Alder', userData.alder || 'Ikke spesifisert'],
      ['Kjønn', userData.kjonn || 'Ikke spesifisert'],
      ['Høyde', userData.hoyde ? `${userData.hoyde} cm` : 'Ikke spesifisert'],
      ['Vekt', userData.vekt ? `${userData.vekt} kg` : 'Ikke spesifisert'],
      ['Aktivitetsnivå', userData.aktivitetsniva || 'Ikke spesifisert'],
      ['Mål', userData.mal || 'Ikke spesifisert'],
      ['Allergier/Preferanser', userData.allergier || 'Ingen']
    ];
    
    userInfo.forEach(([label, value]) => {
      yPosition = checkNewPage(yPosition);
      yPosition = addDataRow(label, value, yPosition);
    });
    
    yPosition += sectionSpacing;
  }
  
  // Parse HTML content
  const parser = new DOMParser();
  const doc2 = parser.parseFromString(content, 'text/html');
  
  // Process content sections
  const sections = {
    'Brukerdata': { color: [41, 128, 185] },
    'Kostholdsplan Beregninger': { color: [41, 128, 185] },
    'Ukentlig Kostholdsplan': { color: [41, 128, 185] },
    'Middagsretter': { color: [41, 128, 185] },
    'Handleliste': { color: [41, 128, 185] },
    'Oppsummering': { color: [41, 128, 185] }
  };
  
  // Process headings
  doc2.querySelectorAll('h2').forEach(heading => {
    const headingText = heading.textContent.trim();
    if (sections[headingText] && headingText !== 'Brukerdata') { // Skip Brukerdata as we already handled it
      yPosition = checkNewPage(yPosition);
      yPosition = addSectionHeader(headingText, yPosition);
      
      // Process content after heading
      let nextElement = heading.nextElementSibling;
      while (nextElement && !nextElement.matches('h2')) {
        if (nextElement.matches('p')) {
          yPosition = checkNewPage(yPosition);
          yPosition = addWrappedText(nextElement.textContent, yPosition) + 5;
        } else if (nextElement.matches('ul, ol')) {
          const items = Array.from(nextElement.children);
          items.forEach((item, index) => {
            yPosition = checkNewPage(yPosition);
            const bullet = nextElement.tagName === 'UL' ? '•' : `${index + 1}.`;
            yPosition = addWrappedText(`${bullet} ${item.textContent}`, yPosition) + 5;
          });
        } else if (nextElement.matches('table')) {
          // Process table
          const rows = Array.from(nextElement.querySelectorAll('tr'));
          const data = rows.map(row => 
            Array.from(row.querySelectorAll('td, th')).map(cell => cell.textContent.trim())
          );
          
          doc.autoTable({
            startY: yPosition,
            head: [data[0]],
            body: data.slice(1),
            theme: 'grid',
            headStyles: {
              fillColor: [41, 128, 185],
              textColor: [255, 255, 255],
              fontSize: 12,
              fontStyle: 'bold'
            },
            bodyStyles: {
              fontSize: 10
            },
            margin: { left: margin }
          });
          
          yPosition = doc.lastAutoTable.finalY + 10;
        }
        nextElement = nextElement.nextElementSibling;
      }
      
      yPosition += sectionSpacing;
    }
  });
  
  // Process meal plan sections
  const mealSections = ['Frokost', 'Formiddagsmat', 'Lunsj', 'Middag', 'Kveldsmat'];
  mealSections.forEach(meal => {
    const mealHeading = Array.from(doc2.querySelectorAll('h3')).find(el => el.textContent.trim() === meal);
    if (mealHeading) {
      yPosition = checkNewPage(yPosition);
      yPosition = addSectionHeader(meal, yPosition);
      
      // Process meal details
      let nextElement = mealHeading.nextElementSibling;
      while (nextElement && !nextElement.matches('h3')) {
        if (nextElement.matches('p')) {
          const text = nextElement.textContent.trim();
          if (text.startsWith('Måltidsnavn:')) {
            yPosition = checkNewPage(yPosition);
            yPosition = addDataRow('Måltidsnavn', text.replace('Måltidsnavn:', '').trim(), yPosition);
          } else if (text.startsWith('Porsjonsstørrelser:')) {
            yPosition = checkNewPage(yPosition);
            yPosition = addDataRow('Porsjonsstørrelser', text.replace('Porsjonsstørrelser:', '').trim(), yPosition);
          } else if (text.startsWith('Næringsinnhold:')) {
            yPosition = checkNewPage(yPosition);
            yPosition = addDataRow('Næringsinnhold', text.replace('Næringsinnhold:', '').trim(), yPosition);
          } else if (text.startsWith('Vanninntak anbefaling:')) {
            yPosition = checkNewPage(yPosition);
            yPosition = addDataRow('Vanninntak', text.replace('Vanninntak anbefaling:', '').trim(), yPosition);
          } else {
            yPosition = checkNewPage(yPosition);
            yPosition = addWrappedText(text, yPosition) + 5;
          }
        } else if (nextElement.matches('ul, ol')) {
          const items = Array.from(nextElement.children);
          items.forEach((item, index) => {
            yPosition = checkNewPage(yPosition);
            const bullet = nextElement.tagName === 'UL' ? '•' : `${index + 1}.`;
            yPosition = addWrappedText(`${bullet} ${item.textContent}`, yPosition) + 5;
          });
        } else if (nextElement.matches('table')) {
          // Process table
          const rows = Array.from(nextElement.querySelectorAll('tr'));
          const data = rows.map(row => 
            Array.from(row.querySelectorAll('td, th')).map(cell => cell.textContent.trim())
          );
          
          doc.autoTable({
            startY: yPosition,
            head: [data[0]],
            body: data.slice(1),
            theme: 'grid',
            headStyles: {
              fillColor: [41, 128, 185],
              textColor: [255, 255, 255],
              fontSize: 12,
              fontStyle: 'bold'
            },
            bodyStyles: {
              fontSize: 10
            },
            margin: { left: margin }
          });
          
          yPosition = doc.lastAutoTable.finalY + 10;
        }
        nextElement = nextElement.nextElementSibling;
      }
      
      yPosition += sectionSpacing;
    }
  });
  
  // Process dinner recipes
  const dinnerSection = Array.from(doc2.querySelectorAll('h2')).find(el => el.textContent.trim() === 'Middagsretter');
  if (dinnerSection) {
    yPosition = checkNewPage(yPosition);
    yPosition = addSectionHeader('Middagsretter', yPosition);
    
    // Check if there's a table in the dinner section
    const dinnerTable = dinnerSection.nextElementSibling?.querySelector('table');
    if (dinnerTable) {
      const rows = Array.from(dinnerTable.querySelectorAll('tr'));
      const data = rows.map(row => 
        Array.from(row.querySelectorAll('td, th')).map(cell => cell.textContent.trim())
      );
      
      doc.autoTable({
        startY: yPosition,
        head: [data[0]],
        body: data.slice(1),
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontSize: 12,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 10
        },
        margin: { left: margin }
      });
      
      yPosition = doc.lastAutoTable.finalY + 10;
    } else {
      // Process each dinner recipe
      let nextElement = dinnerSection.nextElementSibling;
      while (nextElement && !nextElement.matches('h2')) {
        if (nextElement.matches('h3')) {
          yPosition = checkNewPage(yPosition);
          yPosition = addWrappedText(nextElement.textContent, yPosition, { fontSize: 14, color: [41, 128, 185], isBold: true }) + 5;
        } else if (nextElement.matches('p')) {
          yPosition = checkNewPage(yPosition);
          yPosition = addWrappedText(nextElement.textContent, yPosition) + 5;
        } else if (nextElement.matches('ul, ol')) {
          const items = Array.from(nextElement.children);
          items.forEach((item, index) => {
            yPosition = checkNewPage(yPosition);
            const bullet = nextElement.tagName === 'UL' ? '•' : `${index + 1}.`;
            yPosition = addWrappedText(`${bullet} ${item.textContent}`, yPosition) + 5;
          });
        } else if (nextElement.matches('table')) {
          // Process table
          const rows = Array.from(nextElement.querySelectorAll('tr'));
          const data = rows.map(row => 
            Array.from(row.querySelectorAll('td, th')).map(cell => cell.textContent.trim())
          );
          
          doc.autoTable({
            startY: yPosition,
            head: [data[0]],
            body: data.slice(1),
            theme: 'grid',
            headStyles: {
              fillColor: [41, 128, 185],
              textColor: [255, 255, 255],
              fontSize: 12,
              fontStyle: 'bold'
            },
            bodyStyles: {
              fontSize: 10
            },
            margin: { left: margin }
          });
          
          yPosition = doc.lastAutoTable.finalY + 10;
        }
        nextElement = nextElement.nextElementSibling;
      }
    }
    
    yPosition += sectionSpacing;
  }
  
  // Process shopping list
  const shoppingListSection = Array.from(doc2.querySelectorAll('h2')).find(el => el.textContent.trim() === 'Handleliste');
  if (shoppingListSection) {
    yPosition = checkNewPage(yPosition);
    yPosition = addSectionHeader('Handleliste', yPosition);
    
    // Check if there's a table in the shopping list section
    const shoppingTable = shoppingListSection.nextElementSibling?.querySelector('table');
    if (shoppingTable) {
      const rows = Array.from(shoppingTable.querySelectorAll('tr'));
      const data = rows.map(row => 
        Array.from(row.querySelectorAll('td, th')).map(cell => cell.textContent.trim())
      );
      
      doc.autoTable({
        startY: yPosition,
        head: [data[0]],
        body: data.slice(1),
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontSize: 12,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 10
        },
        margin: { left: margin }
      });
      
      yPosition = doc.lastAutoTable.finalY + 10;
    } else {
      // Create shopping list table
      const categories = ['Kjøtt', 'Grønnsaker', 'Kornprodukter', 'Frukt', 'Nøtter/Frø', 'Meieriprodukter', 'Diverse'];
      const shoppingListData = categories.map(category => {
        const categoryHeading = Array.from(doc2.querySelectorAll('h3')).find(el => el.textContent.trim() === category);
        if (categoryHeading) {
          const items = Array.from(categoryHeading.nextElementSibling?.children || [])
            .map(item => item.textContent.trim())
            .join(', ');
          return [category, items];
        }
        return [category, ''];
      });
      
      doc.autoTable({
        startY: yPosition,
        head: [['Kategori', 'Ingredienser']],
        body: shoppingListData,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontSize: 12,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 10
        },
        margin: { left: margin }
      });
      
      yPosition = doc.lastAutoTable.finalY + 10;
    }
    
    yPosition += sectionSpacing;
  }
  
  // Process summary
  const summarySection = Array.from(doc2.querySelectorAll('h2')).find(el => el.textContent.trim() === 'Oppsummering');
  if (summarySection) {
    yPosition = checkNewPage(yPosition);
    yPosition = addSectionHeader('Oppsummering', yPosition);
    
    // Process summary details
    let nextElement = summarySection.nextElementSibling;
    while (nextElement && !nextElement.matches('h2')) {
      if (nextElement.matches('p')) {
        const text = nextElement.textContent.trim();
        if (text.startsWith('Snitt kalorier per dag:')) {
          yPosition = checkNewPage(yPosition);
          yPosition = addDataRow('Kalorier per dag', text.replace('Snitt kalorier per dag:', '').trim(), yPosition);
        } else if (text.startsWith('Snitt protein per dag:')) {
          yPosition = checkNewPage(yPosition);
          yPosition = addDataRow('Protein per dag', text.replace('Snitt protein per dag:', '').trim(), yPosition);
        } else if (text.startsWith('Snitt karbohydrater per dag:')) {
          yPosition = checkNewPage(yPosition);
          yPosition = addDataRow('Karbohydrater per dag', text.replace('Snitt karbohydrater per dag:', '').trim(), yPosition);
        } else if (text.startsWith('Snitt fett per dag:')) {
          yPosition = checkNewPage(yPosition);
          yPosition = addDataRow('Fett per dag', text.replace('Snitt fett per dag:', '').trim(), yPosition);
        } else if (text.startsWith('Estimert vektøkning per uke:')) {
          yPosition = checkNewPage(yPosition);
          yPosition = addDataRow('Vektøkning per uke', text.replace('Estimert vektøkning per uke:', '').trim(), yPosition);
        } else if (text.startsWith('Conkrete supplementeringstips:')) {
          yPosition = checkNewPage(yPosition);
          yPosition = addDataRow('Supplementering', text.replace('Conkrete supplementeringstips:', '').trim(), yPosition);
        } else if (text.startsWith('Meal prep og oppbevaringstips:')) {
          yPosition = checkNewPage(yPosition);
          yPosition = addDataRow('Meal prep tips', text.replace('Meal prep og oppbevaringstips:', '').trim(), yPosition);
        } else {
          yPosition = checkNewPage(yPosition);
          yPosition = addWrappedText(text, yPosition) + 5;
        }
      } else if (nextElement.matches('ul, ol')) {
        const items = Array.from(nextElement.children);
        items.forEach((item, index) => {
          yPosition = checkNewPage(yPosition);
          const bullet = nextElement.tagName === 'UL' ? '•' : `${index + 1}.`;
          yPosition = addWrappedText(`${bullet} ${item.textContent}`, yPosition) + 5;
        });
      } else if (nextElement.matches('table')) {
        // Process table
        const rows = Array.from(nextElement.querySelectorAll('tr'));
        const data = rows.map(row => 
          Array.from(row.querySelectorAll('td, th')).map(cell => cell.textContent.trim())
        );
        
        doc.autoTable({
          startY: yPosition,
          head: [data[0]],
          body: data.slice(1),
          theme: 'grid',
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: [255, 255, 255],
            fontSize: 12,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 10
          },
          margin: { left: margin }
        });
        
        yPosition = doc.lastAutoTable.finalY + 10;
      }
      nextElement = nextElement.nextElementSibling;
    }
  }
  
  // Add page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Side ${i} av ${pageCount}`, 190, 280, { align: 'right' });
  }
  
  // Add footer with CoreMind branding
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Generert av CoreMind', 20, 280);
  
  return doc;
}; 