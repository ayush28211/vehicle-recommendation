document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('vehicleForm');
    const recommendBtn = document.getElementById('recommendBtn');
    const loadingDiv = document.getElementById('loading');
    const recommendationsDiv = document.getElementById('recommendations');
    const resultsDiv = document.getElementById('results');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const budget = document.getElementById('budget').value;
        const mileage = document.getElementById('mileage').value;
        const brand = document.getElementById('brand').value;
        const type = document.getElementById('type').value;
        const additional = document.getElementById('additional').value;
        
        // Show loading state
        recommendBtn.disabled = true;
        loadingDiv.classList.remove('hidden');
        recommendationsDiv.classList.add('hidden');
        
        try {
            // Prepare the prompt for OpenAI
            let prompt = `Provide 3 vehicle recommendations based on these criteria:
            - Budget: ${budget}
            - Preferred mileage: ${mileage}
            - Vehicle type: ${type}`;
            
            if (brand) {
                prompt += `\n- Preferred brand: ${brand}`;
            }
            
            if (additional) {
                prompt += `\n- Additional requirements: ${additional}`;
            }
            
            prompt += `\n\nFor each recommendation, provide:
            - Make and model
            - Approximate price range
            - Estimated MPG (or electric range if applicable)
            - Key features
            - Pros and cons
            - A brief summary of why it matches the criteria
            
            Format each recommendation as a clear section with headings.`;
            
            // Call OpenAI API
            const recommendations = await getOpenAIRecommendation(prompt);
            
            // Display results
            resultsDiv.innerHTML = formatRecommendations(recommendations);
            recommendationsDiv.classList.remove('hidden');
        } catch (error) {
            resultsDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
            recommendationsDiv.classList.remove('hidden');
        } finally {
            loadingDiv.classList.add('hidden');
            recommendBtn.disabled = false;
        }
    });
    
    async function getOpenAIRecommendation(prompt) {
        // Replace with your actual OpenAI API key
        const OPENAI_API_KEY = 'sk-your-openai-api-key-here';
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a knowledgeable vehicle recommendation assistant. Provide detailed, accurate vehicle recommendations based on user criteria. Include specific models, pricing, features, and pros/cons."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to get recommendations');
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    function formatRecommendations(vehicles) {
        return vehicles.map(vehicle => `
            <div class="vehicle-card" data-id="${vehicle.id}">
                <div class="vehicle-image-container">
                    <img src="${vehicle.image}" alt="${vehicle.make}" class="vehicle-image">
                    <div class="vehicle-rating">${vehicle.rating} ★</div>
                </div>
                <div class="vehicle-content">
                    <div class="vehicle-header">
                        <h3 class="vehicle-title">${vehicle.make}</h3>
                        <span class="vehicle-price">${vehicle.price}</span>
                    </div>
                    <div class="vehicle-specs">
                        <p class="spec-highlight">${vehicle.mpg}</p>
                    </div>
                    <div class="vehicle-details">
                        <div class="features-section">
                            <h4>Key Features</h4>
                            <ul class="features-list">
                                ${vehicle.features.map(f => `<li>${f}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="pros-cons-grid">
                            <div class="pros-box">
                                <h4>👍 Pros</h4>
                                <ul>${vehicle.pros.map(p => `<li>${p}</li>`).join('')}</ul>
                            </div>
                            <div class="cons-box">
                                <h4>👎 Cons</h4>
                                <ul>${vehicle.cons.map(c => `<li>${c}</li>`).join('')}</ul>
                            </div>
                        </div>
                    </div>
                    <div class="match-reason">
                        <p>${vehicle.matchReason}</p>
                    </div>
                    <button class="compare-btn">Add to Compare</button>
                </div>
            </div>
        `).join('');
    }

});