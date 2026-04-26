// ============================================================
// AI DOCTRINE PROCESSOR (RAG + GROQ INTEGRATION)
// [HACKATHON SHOWCASE — EXPERIMENTAL]
// ============================================================

/**
 * Mock RAG implementation for doctrine retrieval.
 * Simulates vector search across CSIS and AFDP doctrine PDFs.
 */
class DoctrineRAG {
  constructor() {
    this.apiKey = "gsk_mock_key_wargaming_hackathon_2026"; // Mock Groq Key
    this.doctrineChunks = [
      { id: 1, text: "JP 3-0: Joint Operations emphasize the use of deterrence and flexible deterrent options (FDOs) to signal resolve and prevent escalation." },
      { id: 2, text: "CSIS First Battle (2023): In most scenarios, the United States expended its entire stock of long-range anti-ship missiles within the first week of conflict." },
      { id: 3, text: "AFDP 3-0: Strategic strikes should target adversary C2 and logistics hubs while preserving a clear diplomatic off-ramp to avoid nuclear threshold crossing." },
      { id: 4, text: "CSIS Lights Out (2025): Taiwan's LNG reserves are the critical operational clock; failure to secure maritime corridors leads to total energy collapse in < 14 days." }
    ];
  }

  /**
   * Simulates a vector embedding search
   */
  async retrieveContext(query) {
    console.log(`[RAG] Searching vector database for: "${query}"...`);
    // Simulate latency
    await new Promise(r => setTimeout(r, 800));
    
    // Simple mock keyword match for show
    const results = this.doctrineChunks.filter(chunk => 
      query.toLowerCase().split(' ').some(word => chunk.text.toLowerCase().includes(word))
    );
    
    return results.length > 0 ? results : [this.doctrineChunks[0]];
  }

  /**
   * Simulates a call to GROQ API with RAG context
   */
  async queryGroq(query) {
    const context = await this.retrieveContext(query);
    const contextString = context.map(c => c.text).join('\n');

    console.log(`[Groq] Calling Llama-3-70b via Groq API...`);
    
    // This is a simulated fetch to the Groq API
    /*
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: 'You are a military doctrine expert. Use the provided context to answer wargaming queries.' },
          { role: 'user', content: `Context: ${contextString}\n\nQuery: ${query}` }
        ]
      })
    });
    */

    // Simulated Response for the UI
    await new Promise(r => setTimeout(r, 1200));
    return {
      answer: `Based on the retrieved doctrine (specifically ${context[0].id}), the proposed action aligns with standard FDO (Flexible Deterrent Option) protocols. However, logistics analysis suggest a ${query.includes('lrasm') ? 'high burn rate' : 'critical shortage'} risk within 72 hours.`,
      source: context[0].text
    };
  }
}

const ragEngine = new DoctrineRAG();

async function runAIDoctrineSearch() {
  const query = prompt("ENTER TACTICAL QUERY (e.g. 'LNG blockade risk' or 'DF-26 engagement'):");
  if (!query) return;

  const resultContainer = document.getElementById('whiteCellPanel');
  resultContainer.innerHTML = '<div class="thinking-indicator"><span class="cursor-blink"></span> RAG: RETRIEVING DOCTRINE...</div>';

  try {
    const response = await ragEngine.queryGroq(query);
    
    resultContainer.innerHTML = `
      <div style="color: #4DA8FF; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #1A6EBF;">
        AI ADVISOR (GROQ + RAG)
      </div>
      <div style="font-family: 'DM Mono', monospace; font-size: 11px; margin-bottom: 12px; color: var(--text-primary);">
        "${response.answer}"
      </div>
      <div style="font-size: 9px; color: var(--text-dim); background: rgba(0,0,0,0.3); padding: 8px; border-left: 2px solid #00FF88;">
        <b style="color: #00FF88;">RETRIEVED DOCTRINE:</b><br>
        ${response.source}
      </div>
    `;
  } catch (err) {
    resultContainer.innerHTML = `<div style="color: red;">Error calling AI Engine: ${err.message}</div>`;
  }
}
