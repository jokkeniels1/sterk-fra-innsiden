import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = async (content, title, userData = null) => {
  try {
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
    
    // Function to check if we need a new page
    const checkNewPage = (yPos, requiredSpace = 40) => {
      if (yPos + requiredSpace > 270) {
        doc.addPage();
        return 40;
      }
      return yPos;
    };
    
    // Function to add text with proper wrapping
    const addWrappedText = (text, y, options = {}) => {
      if (!text) return y;
      
      const {
        fontSize = 12,
        color = [0, 0, 0],
        align = 'left',
        isBold = false
      } = options;
      
      y = checkNewPage(y);
      
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      if (isBold) doc.setFont('helvetica', 'bold');
      else doc.setFont('helvetica', 'normal');
      
      const splitText = doc.splitTextToSize(text, maxWidth);
      doc.text(splitText, margin, y, { align });
      return y + (splitText.length * (fontSize * 0.5)) + 5;
    };
    
    // Function to add a section header
    const addSectionHeader = (text, y) => {
      if (!text) return y;
      
      y = checkNewPage(y, 60);
      
      doc.setFontSize(18);
      doc.setTextColor(41, 128, 185);
      doc.setFont('helvetica', 'bold');
      doc.text(text, margin, y);
      
      doc.setDrawColor(41, 128, 185);
      doc.setLineWidth(0.5);
      doc.line(margin, y + 5, margin + maxWidth, y + 5);
      return y + 20;
    };
    
    // Function to add a subsection header
    const addSubsectionHeader = (text, y) => {
      if (!text) return y;
      
      y = checkNewPage(y, 40);
      
      doc.setFontSize(14);
      doc.setTextColor(41, 128, 185);
      doc.setFont('helvetica', 'bold');
      doc.text(text, margin, y);
      
      return y + 15;
    };
    
    // Function to add a data row
    const addDataRow = (label, value, y) => {
      if (!label || !value) return y;
      
      y = checkNewPage(y);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text(`${label}:`, margin, y);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const valueText = doc.splitTextToSize(value.toString(), maxWidth - 60);
      doc.text(valueText, margin + 60, y);
      
      return y + (valueText.length * 7) + 5;
    };
    
    // Function to add a meal section
    const addMealSection = (mealName, mealData, y) => {
      if (!mealName || !mealData) return y;
      
      y = addSubsectionHeader(mealName, y);
      
      // Add meal title if available
      if (mealData.title) {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(mealData.title, margin, y);
        y += 10;
      }
      
      // Add portions if available
      if (mealData.portions && Object.keys(mealData.portions).length > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Porsjonsstørrelser:', margin, y);
        y += 7;
        
        Object.entries(mealData.portions).forEach(([ingredient, amount]) => {
          y = checkNewPage(y, 15);
          doc.text(`• ${ingredient}: ${amount}`, margin + 5, y);
          y += 7;
        });
        
        y += 5;
      }
      
      // Add nutritional info if available
      if (mealData.nutrition) {
        y = checkNewPage(y);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Næringsinnhold:', margin, y);
        y += 7;
        
        doc.setFont('helvetica', 'normal');
        const nutrition = mealData.nutrition;
        const nutritionText = `${nutrition.calories} kcal, ${nutrition.protein}g protein, ${nutrition.carbs}g karbohydrater, ${nutrition.fat}g fett`;
        const nutritionLines = doc.splitTextToSize(nutritionText, maxWidth - margin - 5);
        doc.text(nutritionLines, margin + 5, y);
        y += (nutritionLines.length * 7) + 5;
      }
      
      return y + 5;
    };

    let yPosition = 40;

    // Add title on the first page
    if (title) {
      doc.setFontSize(24);
      doc.setTextColor(41, 128, 185);
      doc.setFont('helvetica', 'bold');
      const titleLines = doc.splitTextToSize(title, maxWidth);
      doc.text(titleLines, margin, yPosition);
      yPosition += (titleLines.length * 15) + 10;
    }

    // Process user data if available
    if (userData) {
      yPosition = addSectionHeader('Brukerdata', yPosition);
      
      // Add user data as a table
      doc.autoTable({
        startY: yPosition,
        head: [['Informasjon', 'Verdi']],
        body: [
          ['Navn', userData.navn || 'Ikke spesifisert'],
          ['Alder', userData.alder || 'Ikke spesifisert'],
          ['Kjønn', userData.kjonn || 'Ikke spesifisert'],
          ['Høyde', userData.hoyde ? `${userData.hoyde} cm` : 'Ikke spesifisert'],
          ['Vekt', userData.vekt ? `${userData.vekt} kg` : 'Ikke spesifisert'],
          ['Aktivitetsnivå', userData.aktivitetsniva || 'Ikke spesifisert'],
          ['Mål', userData.mal || 'Ikke spesifisert'],
          ['Allergier/Preferanser', userData.allergier || 'Ingen']
        ],
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
    }

    // Function to generate meal plan from API
    const generateMealPlanFromAPI = async (userData) => {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Generate a personalized meal plan based on the following user data:
              Age: ${userData.alder}
              Gender: ${userData.kjonn}
              Height: ${userData.hoyde}cm
              Weight: ${userData.vekt}kg
              Activity Level: ${userData.aktivitetsniva}
              Goals: ${userData.mal}
              Allergies/Preferences: ${userData.allergier}
              
              Please provide a detailed meal plan with:
              1. Daily caloric and macro targets
              2. Breakfast, lunch, dinner, and snacks
              3. Portion sizes and nutritional information
              4. Weekly shopping list
              5. Meal prep instructions`
          })
        });

        if (!response.ok) {
          throw new Error('Failed to generate meal plan');
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error generating meal plan:', error);
        throw error;
      }
    };

    // Process main content
    if (content) {
      try {
        // Generate meal plan from API
        const mealPlan = await generateMealPlanFromAPI(userData);
        
        if (mealPlan) {
          // Process each day
          mealPlan.weeklyPlan.forEach(day => {
            doc.addPage();
            yPosition = 40;
            
            // Add day header
            yPosition = addSectionHeader(day.day, yPosition);
            
            // Process each meal
            day.meals.forEach(meal => {
              // Add meal name
              yPosition = addSubsectionHeader(meal.name, yPosition);
              
              // Add dish name
              doc.setFontSize(12);
              doc.setTextColor(0, 0, 0);
              doc.setFont('helvetica', 'bold');
              doc.text(meal.dish, margin, yPosition);
              yPosition += 10;
              
              // Add ingredients
              doc.setFontSize(10);
              doc.setFont('helvetica', 'normal');
              doc.text('Ingredienser:', margin, yPosition);
              yPosition += 7;
              
              meal.ingredients.forEach(ingredient => {
                yPosition = checkNewPage(yPosition, 15);
                doc.text(`• ${ingredient.item} - ${ingredient.amount}`, margin + 5, yPosition);
                yPosition += 7;
              });
              
              yPosition += 5;
              
              // Add nutrition info
              doc.setFont('helvetica', 'bold');
              doc.text('Næringsinnhold:', margin, yPosition);
              yPosition += 7;
              
              doc.setFont('helvetica', 'normal');
              doc.text(
                `${meal.nutrition.calories} kcal, ${meal.nutrition.protein}g protein, ` +
                `${meal.nutrition.carbs}g karbohydrater, ${meal.nutrition.fat}g fett`,
                margin + 5,
                yPosition
              );
              
              yPosition += 10;
              
              // Add cooking instructions
              yPosition = addMealInstructions(doc, meal, yPosition);
              
              yPosition += 10;
            });
          });
        } else {
          // Fallback to basic meal plan if API fails
          // Create a temporary div to parse HTML content
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = content;
          
          // Process each section
          const sections = Array.from(tempDiv.querySelectorAll('section'));
          sections.forEach(section => {
            const title = section.querySelector('h1, h2, h3')?.textContent?.trim() || '';
            
            if (title) {
              doc.addPage(); // Start new page for each section
              yPosition = 40;
              yPosition = addSectionHeader(title, yPosition);
              
              // Special handling for Ukentlig Kostholdsplan section
              if (title === 'Ukentlig Kostholdsplan') {
                // Create a detailed meal plan table
                const mealPlanData = [
                  ['Frokost', 'Havregryn - 50 g, Melk - 200 ml, Banan - 1 stk', '400 kcal, 25g protein, 60g karbohydrater, 8g fett'],
                  ['Formiddagsmat', 'Cottage Cheese - 150 g, Valnøtter - 30 g', '300 kcal, 25g protein, 10g karbohydrater, 15g fett'],
                  ['Lunsj', 'Kyllingfilet - 150 g, Fullkornris - 100 g, Brokkoli - 100 g', '500 kcal, 40g protein, 60g karbohydrater, 10g fett'],
                  ['Middag', 'Se ukesmiddagsplan nedenfor', 'Varierende'],
                  ['Kveldsmat', 'Mager kesam - 200 g, Bær - 100 g, Mandler - 20 g', '350 kcal, 30g protein, 20g karbohydrater, 15g fett']
                ];
                
                doc.autoTable({
                  startY: yPosition,
                  head: [['Måltid', 'Ingredienser', 'Næringsinnhold']],
                  body: mealPlanData,
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
                
                yPosition = doc.lastAutoTable.finalY + 15;
                
                // Add water intake recommendation
                yPosition = addWrappedText('Vanninntak anbefaling: 3 liter per dag', yPosition, { fontSize: 12, isBold: true });
                
                // Add weekly dinner plan
                yPosition = checkNewPage(yPosition, 100);
                yPosition = addSectionHeader('Ukesmiddagsplan', yPosition);
                
                const weeklyDinnerPlan = generateWeeklyDinnerPlan(userData);
                const dinnerPlanData = weeklyDinnerPlan.map(day => [
                  day.day,
                  day.meal,
                  day.ingredients,
                  day.nutrition
                ]);
                
                doc.autoTable({
                  startY: yPosition,
                  head: [['Dag', 'Måltid', 'Ingredienser', 'Næringsinnhold']],
                  body: dinnerPlanData,
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
                
                yPosition = doc.lastAutoTable.finalY + 15;
                
                // Add protein calculation explanation
                const proteinNeeds = calculateProteinNeeds(userData);
                yPosition = addWrappedText(
                  `Proteinberegning: Basert på din vekt (${userData.vekt}kg) og aktivitetsnivå (${userData.aktivitetsniva}), ` +
                  `trenger du ca. ${proteinNeeds}g protein per dag. Dette er fordelt over 5 måltider, ` +
                  `hvor middagen inneholder ca. ${Math.round(proteinNeeds/5 * 1.2)}g protein.`,
                  yPosition,
                  { fontSize: 10, isBold: false }
                );
              } else {
                // Process paragraphs
                section.querySelectorAll('p').forEach(p => {
                  const text = p.textContent.trim();
                  if (text) {
                    yPosition = addWrappedText(text, yPosition);
                  }
                });
                
                // Process lists
                section.querySelectorAll('ul, ol').forEach(list => {
                  const items = Array.from(list.querySelectorAll('li')).map(li => li.textContent.trim());
                  items.forEach(item => {
                    yPosition = addWrappedText(`• ${item}`, yPosition);
                  });
                });
                
                // Process tables
                section.querySelectorAll('table').forEach(table => {
                  const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
                  const rows = Array.from(table.querySelectorAll('tr')).slice(1).map(row => 
                    Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim())
                  );
                  
                  if (headers.length > 0 || rows.length > 0) {
                    yPosition = checkNewPage(yPosition, 60);
                    doc.autoTable({
                      startY: yPosition,
                      head: [headers],
                      body: rows,
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
                });
                
                // Process meal sections
                section.querySelectorAll('.meal-section').forEach(mealSection => {
                  const mealName = mealSection.querySelector('.meal-name')?.textContent.trim() || '';
                  const mealData = {
                    navn: mealSection.querySelector('.meal-title')?.textContent.trim(),
                    porsjonsstorrelser: {},
                    næringsinnhold: mealSection.querySelector('.meal-nutrition')?.textContent.trim()
                  };
                  
                  // Extract portions
                  mealSection.querySelectorAll('.meal-portion').forEach(portion => {
                    const ingredient = portion.querySelector('.ingredient')?.textContent.trim();
                    const amount = portion.querySelector('.amount')?.textContent.trim();
                    if (ingredient && amount) {
                      mealData.porsjonsstorrelser[ingredient] = amount;
                    }
                  });
                  
                  yPosition = addMealSection(mealName, mealData, yPosition);
                });
              }
            }
          });
        }
      } catch (error) {
        console.error('Error processing content:', error);
        yPosition = addWrappedText('Error processing content. Please check the format.', yPosition);
      }
    }

    // Add page numbers and footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Side ${i} av ${pageCount}`, 190, 280, { align: 'right' });
      doc.text('Generert av CoreMind', 20, 280);
    }

    // Return the PDF document
    return doc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Test function to verify PDF generation
export const testPDFGeneration = async () => {
  console.log('Starting PDF generation test...');
  
  const sampleContent = `
    <section>
      <h2>Brukerdata</h2>
      <table>
        <tr>
          <th>Informasjon</th>
          <th>Verdi</th>
        </tr>
        <tr>
          <td>Navn</td>
          <td>Joachim Nielsen</td>
        </tr>
        <tr>
          <td>Alder</td>
          <td>34</td>
        </tr>
        <tr>
          <td>Kjønn</td>
          <td>Mann</td>
        </tr>
        <tr>
          <td>Høyde</td>
          <td>185 cm</td>
        </tr>
        <tr>
          <td>Vekt</td>
          <td>96 kg</td>
        </tr>
        <tr>
          <td>Aktivitetsnivå</td>
          <td>Moderat aktiv</td>
        </tr>
        <tr>
          <td>Mål</td>
          <td>Bygge muskler</td>
        </tr>
        <tr>
          <td>Allergier/Preferanser</td>
          <td>Ingen</td>
        </tr>
      </table>
    </section>
    
    <section>
      <h2>Kostholdsplan Beregninger</h2>
      <p>Estimert TDEE: 2800 kcal</p>
      <p>Anbefalt daglig proteininntak: 160 g</p>
      <p>Anbefalt makronæringsfordeling:</p>
      <ul>
        <li>Protein: 25%</li>
        <li>Karbohydrater: 50%</li>
        <li>Fett: 25%</li>
      </ul>
    </section>
    
    <section>
      <h2>Ukentlig Kostholdsplan</h2>
      
      <div class="meal-section">
        <h3 class="meal-name">Frokost</h3>
        <p class="meal-title">Havregryn med bær og nøtter</p>
        <p>Porsjonsstørrelser:</p>
        <div class="meal-portion">
          <span class="ingredient">Havregryn</span>
          <span class="amount">50g</span>
        </div>
        <div class="meal-portion">
          <span class="ingredient">Blandede bær</span>
          <span class="amount">100g</span>
        </div>
        <div class="meal-portion">
          <span class="ingredient">Mandler</span>
          <span class="amount">30g</span>
        </div>
        <p class="meal-nutrition">Næringsinnhold: 400 kcal, 20g protein, 50g karbohydrater, 15g fett</p>
      </div>
      
      <p>Vanninntak anbefaling: 2 liter per dag</p>
      
      <div class="meal-section">
        <h3 class="meal-name">Formiddagsmat</h3>
        <p>Eksempel: Proteindrink</p>
      </div>
      
      <div class="meal-section">
        <h3 class="meal-name">Lunsj</h3>
        <p>Eksempel: Kyllingsalat med quinoa og avokado</p>
      </div>
      
      <div class="meal-section">
        <h3 class="meal-name">Middag</h3>
        <p>Eksempel: Se oppskrifter i middagsseksjonen nedenfor</p>
      </div>
      
      <div class="meal-section">
        <h3 class="meal-name">Kveldsmat</h3>
        <p>Eksempel: Kesam med frukt og nøtter</p>
      </div>
    </section>
    
    <section>
      <h2>Middagsretter</h2>
      <table>
        <tr>
          <th>Navn på rett</th>
          <th>Ingredienser</th>
          <th>Tilberedelsesinstruksjoner</th>
          <th>Næringsinnhold per porsjon</th>
        </tr>
        <tr>
          <td>Kjøttboller i tomatsaus med fullkornspasta</td>
          <td>Kjøttdeig: 150g<br>Tomatsaus: 100g<br>Fullkornspasta: 80g</td>
          <td>Stek kjøttboller, tilsett tomatsaus og server over kokt pasta</td>
          <td>500 kcal, 30g protein, 60g karbohydrater, 15g fett</td>
        </tr>
      </table>
    </section>
    
    <section>
      <h2>Handleliste</h2>
      <table>
        <tr>
          <th>Kategori</th>
          <th>Ingredienser</th>
          <th>Mengde</th>
        </tr>
        <tr>
          <td>Kjøtt</td>
          <td>Kyllingbryst</td>
          <td>750g</td>
        </tr>
        <tr>
          <td>Grønnsaker</td>
          <td>Blandede grønnsaker</td>
          <td>1 kg</td>
        </tr>
      </table>
    </section>
    
    <section>
      <h2>Oppsummering</h2>
      <p>Snitt kalorier per dag: 2500 kcal</p>
      <p>Snitt protein per dag: 160g</p>
      <p>Snitt karbohydrater per dag: 300g</p>
      <p>Snitt fett per dag: 70g</p>
      <p>Estimert vektøkning per uke: 0.5 kg</p>
      <p>Konkrete supplementeringstips: Ta kreatin og omega-3 tilskudd</p>
      <p>Meal prep og oppbevaringstips: Forbered måltider i helgen og oppbevar i porsjonsbegre</p>
    </section>
  `;

  const userData = {
    navn: "Joachim Nielsen",
    alder: "34",
    kjonn: "Mann",
    hoyde: "185",
    vekt: "96",
    aktivitetsniva: "Moderat aktiv",
    mal: "Bygge muskler",
    allergier: "Ingen"
  };

  try {
    console.log('Creating PDF document...');
    const doc = await generatePDF(sampleContent, "Personlig Kostholdsplan", userData);
    
    console.log('PDF generated successfully!');
    return doc; // Return the PDF document instead of saving it directly
  } catch (error) {
    console.error('Error in testPDFGeneration:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

// Function to calculate protein needs based on user data
const calculateProteinNeeds = (userData) => {
  if (!userData || !userData.vekt || !userData.aktivitetsniva) return 160; // Default value
  
  const weight = parseFloat(userData.vekt);
  const activityLevel = userData.aktivitetsniva.toLowerCase();
  
  // Base multiplier based on activity level
  let multiplier = 1.6; // Default for moderate activity
  
  if (activityLevel.includes('veldig aktiv') || activityLevel.includes('ekstremt aktiv')) {
    multiplier = 2.2;
  } else if (activityLevel.includes('aktiv')) {
    multiplier = 2.0;
  } else if (activityLevel.includes('lett aktiv')) {
    multiplier = 1.8;
  } else if (activityLevel.includes('inaktiv')) {
    multiplier = 1.4;
  }
  
  return Math.round(weight * multiplier);
};

// Function to generate weekly dinner plan
const generateWeeklyDinnerPlan = (userData) => {
  const proteinNeeds = calculateProteinNeeds(userData);
  const dailyProteinTarget = Math.round(proteinNeeds / 5); // Assuming 5 meals per day
  
  return [
    {
      day: 'Mandag',
      meal: 'Kyllingfilet med søtpotet og brokkoli',
      ingredients: `Kyllingfilet - ${Math.round(dailyProteinTarget * 1.2)}g, Søtpotet - 150g, Brokkoli - 100g`,
      nutrition: `${Math.round(dailyProteinTarget * 1.2 * 4 + 150 * 0.9 + 100 * 0.3)} kcal, ${Math.round(dailyProteinTarget * 1.2)}g protein, 45g karbohydrater, 15g fett`
    },
    {
      day: 'Tirsdag',
      meal: 'Laks med quinoa og asparges',
      ingredients: `Laks - ${Math.round(dailyProteinTarget * 1.2)}g, Quinoa - 100g, Asparges - 100g`,
      nutrition: `${Math.round(dailyProteinTarget * 1.2 * 4 + 100 * 1.2 + 100 * 0.2)} kcal, ${Math.round(dailyProteinTarget * 1.2)}g protein, 40g karbohydrater, 20g fett`
    },
    {
      day: 'Onsdag',
      meal: 'Kjøttdeig med fullkornris og grønnsaker',
      ingredients: `Kjøttdeig - ${Math.round(dailyProteinTarget * 1.2)}g, Fullkornris - 100g, Blandede grønnsaker - 150g`,
      nutrition: `${Math.round(dailyProteinTarget * 1.2 * 4 + 100 * 1.3 + 150 * 0.3)} kcal, ${Math.round(dailyProteinTarget * 1.2)}g protein, 50g karbohydrater, 25g fett`
    },
    {
      day: 'Torsdag',
      meal: 'Torsk med potet og erter',
      ingredients: `Torsk - ${Math.round(dailyProteinTarget * 1.2)}g, Potet - 200g, Erter - 100g`,
      nutrition: `${Math.round(dailyProteinTarget * 1.2 * 4 + 200 * 0.8 + 100 * 0.5)} kcal, ${Math.round(dailyProteinTarget * 1.2)}g protein, 35g karbohydrater, 10g fett`
    },
    {
      day: 'Fredag',
      meal: 'Kyllingfilet med fullkornspasta og tomatsaus',
      ingredients: `Kyllingfilet - ${Math.round(dailyProteinTarget * 1.2)}g, Fullkornspasta - 100g, Tomatsaus - 100g`,
      nutrition: `${Math.round(dailyProteinTarget * 1.2 * 4 + 100 * 1.3 + 100 * 0.3)} kcal, ${Math.round(dailyProteinTarget * 1.2)}g protein, 55g karbohydrater, 15g fett`
    },
    {
      day: 'Lørdag',
      meal: 'Laks med ovnsbakte poteter og grønnsaker',
      ingredients: `Laks - ${Math.round(dailyProteinTarget * 1.2)}g, Potet - 200g, Blandede grønnsaker - 150g`,
      nutrition: `${Math.round(dailyProteinTarget * 1.2 * 4 + 200 * 0.8 + 150 * 0.3)} kcal, ${Math.round(dailyProteinTarget * 1.2)}g protein, 45g karbohydrater, 20g fett`
    },
    {
      day: 'Søndag',
      meal: 'Kyllingfilet med ris og brokkoli',
      ingredients: `Kyllingfilet - ${Math.round(dailyProteinTarget * 1.2)}g, Fullkornris - 100g, Brokkoli - 100g`,
      nutrition: `${Math.round(dailyProteinTarget * 1.2 * 4 + 100 * 1.3 + 100 * 0.3)} kcal, ${Math.round(dailyProteinTarget * 1.2)}g protein, 50g karbohydrater, 15g fett`
    }
  ];
};

// Function to add meal instructions to PDF
const addMealInstructions = (doc, meal, yPosition) => {
  if (!meal.instructions) return yPosition;
  
  yPosition = checkNewPage(yPosition, 40);
  
  doc.setFontSize(12);
  doc.setTextColor(41, 128, 185);
  doc.setFont('helvetica', 'bold');
  doc.text('Tilberedningsinstruksjoner:', margin, yPosition);
  
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  
  meal.instructions.forEach((instruction, index) => {
    yPosition = checkNewPage(yPosition, 15);
    doc.text(`${index + 1}. ${instruction}`, margin + 5, yPosition);
    yPosition += 7;
  });
  
  return yPosition + 5;
}; 