class PromptGenerator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.currentPrompt = '';
        this.isEditing = false;
    }

    initializeElements() {
        // Form elements
        this.form = document.getElementById('promptForm');
        this.objectiveInput = document.getElementById('objective');
        this.audienceInput = document.getElementById('audience');
        this.contextInput = document.getElementById('context');
        this.constraintsInput = document.getElementById('constraints');
        this.brandVoiceInput = document.getElementById('brandVoice');
        this.ctaInput = document.getElementById('cta');
        this.examplesInput = document.getElementById('examples');
        this.variationsInput = document.getElementById('variations');
        this.stepByStepInput = document.getElementById('stepByStep');

        // Preview elements
        this.previewContent = document.getElementById('previewContent');
        this.editablePreview = document.getElementById('editablePreview');
        this.editablePrompt = document.getElementById('editablePrompt');

        // Button elements
        this.clearFormBtn = document.getElementById('clearForm');
        this.editPromptBtn = document.getElementById('editPrompt');
        this.copyPromptBtn = document.getElementById('copyPrompt');
        this.saveEditBtn = document.getElementById('saveEdit');
        this.cancelEditBtn = document.getElementById('cancelEdit');

        // Output elements
        this.outputSection = document.getElementById('outputSection');
        this.finalPrompt = document.getElementById('finalPrompt');
        this.copyFinalPromptBtn = document.getElementById('copyFinalPrompt');
        this.downloadPromptBtn = document.getElementById('downloadPrompt');
        this.newPromptBtn = document.getElementById('newPrompt');

        // Toast element
        this.toast = document.getElementById('toast');
        this.toastMessage = document.getElementById('toastMessage');
    }

    bindEvents() {
        // Real-time preview updates
        [this.objectiveInput, this.audienceInput, this.contextInput, this.constraintsInput, 
         this.brandVoiceInput, this.ctaInput, this.examplesInput, this.variationsInput, this.stepByStepInput].forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
            input.addEventListener('change', () => this.updatePreview());
        });

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Button events
        this.clearFormBtn.addEventListener('click', () => this.clearForm());
        this.editPromptBtn.addEventListener('click', () => this.enableEditing());
        this.copyPromptBtn.addEventListener('click', () => this.copyToClipboard(this.currentPrompt));
        this.saveEditBtn.addEventListener('click', () => this.saveEdit());
        this.cancelEditBtn.addEventListener('click', () => this.cancelEdit());
        this.copyFinalPromptBtn.addEventListener('click', () => this.copyToClipboard(this.finalPrompt.textContent));
        this.downloadPromptBtn.addEventListener('click', () => this.downloadPrompt());
        this.newPromptBtn.addEventListener('click', () => this.createNewPrompt());
    }

    updatePreview() {
        if (this.isEditing) return;

        const formData = this.getFormData();
        const prompt = this.generatePrompt(formData);
        
        if (prompt.trim()) {
            this.currentPrompt = prompt;
            this.previewContent.innerHTML = `<div class="generated-prompt">${this.escapeHtml(prompt)}</div>`;
        } else {
            this.showPlaceholder();
        }
    }

    showPlaceholder() {
        this.previewContent.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-magic"></i>
                <p>Your generated prompt will appear here as you fill out the form above.</p>
                <p>Start by entering your objective or task!</p>
            </div>
        `;
    }

    getFormData() {
        return {
            objective: this.objectiveInput.value.trim(),
            audience: this.audienceInput.value.trim(),
            context: this.contextInput.value.trim(),
            constraints: this.constraintsInput.value.trim(),
            brandVoice: this.brandVoiceInput.value,
            cta: this.ctaInput.value,
            examples: this.examplesInput.value.trim(),
            variations: this.variationsInput.value,
            stepByStep: this.stepByStepInput.checked
        };
    }

    generatePrompt(data) {
        if (!data.objective) return '';

        let prompt = '';

        // Start with a natural, conversational opener
        prompt += `I'm looking for help with the following task: ${data.objective}`;

        // Add audience context in natural language
        if (data.audience) {
            prompt += `\n\nThis is intended for: ${data.audience}`;
        }

        // Add context/background naturally
        if (data.context) {
            prompt += `\n\nBackground context: ${data.context}`;
        }

        // Add brand voice/tone guidance
        if (data.brandVoice) {
            const voiceDescriptions = {
                'professional': 'professional and formal',
                'friendly': 'friendly and approachable', 
                'confident': 'confident and authoritative',
                'playful': 'playful and fun',
                'humble': 'humble and modest',
                'aspirational': 'aspirational and inspiring',
                'conversational': 'conversational and casual',
                'empathetic': 'empathetic and understanding',
                'bold': 'bold and direct',
                'sophisticated': 'sophisticated and elegant'
            };
            prompt += `\n\nPlease use a ${voiceDescriptions[data.brandVoice]} tone throughout.`;
        }

        // Add specific requirements and constraints
        if (data.constraints) {
            prompt += `\n\nSpecific requirements: ${data.constraints}`;
        }

        // Add examples/style guidance
        if (data.examples) {
            prompt += `\n\nStyle guidance and examples: ${data.examples}`;
        }

        // Add CTA instruction
        if (data.cta && data.cta !== '') {
            const ctaInstructions = {
                'engage': 'Include elements that encourage audience engagement such as asking questions or inviting comments/shares',
                'visit': 'Include a clear call-to-action that drives traffic to a website or specific link',
                'contact': 'Include a call-to-action that encourages the audience to get in touch or make an inquiry',
                'purchase': 'Include persuasive elements that encourage purchase, sign-up, or conversion',
                'learn': 'Focus on educational value and encourage further learning or exploration',
                'subscribe': 'Include calls-to-action for subscription, following, or joining',
                'download': 'Promote and encourage downloading, trying, or accessing something',
                'attend': 'Include compelling reasons and calls-to-action for event attendance',
                'apply': 'Encourage applications, submissions, or participation',
                'custom': 'Follow the custom call-to-action specified in the requirements above'
            };
            prompt += `\n\nCall-to-action focus: ${ctaInstructions[data.cta]}`;
        }

        // Add step-by-step instruction if requested
        if (data.stepByStep) {
            prompt += `\n\nPlease provide your response in a clear, step-by-step format that's easy to follow.`;
        }

        // Add variations instruction if specified
        if (data.variations && parseInt(data.variations) > 1) {
            prompt += `\n\nPlease provide ${data.variations} different variations of this content, each with a slightly different approach or emphasis.`;
        }

        // End with a polite, encouraging note
        prompt += `\n\nThank you for your assistance!`;

        return prompt.trim();
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = this.getFormData();
        
        if (!formData.objective) {
            this.showToast('Please enter an objective or task.', 'error');
            this.objectiveInput.focus();
            return;
        }

        // Show loading state
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalContent = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading"></div> Generating...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/generate-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                this.showFinalPrompt(result.prompt);
                this.showToast('Prompt generated successfully!');
            } else {
                throw new Error(result.error || 'Failed to generate prompt');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showToast('Failed to generate prompt. Please try again.', 'error');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalContent;
            submitBtn.disabled = false;
        }
    }

    showFinalPrompt(prompt) {
        this.finalPrompt.textContent = prompt;
        this.outputSection.style.display = 'block';
        this.outputSection.scrollIntoView({ behavior: 'smooth' });
    }

    clearForm() {
        this.form.reset();
        this.updatePreview();
        this.outputSection.style.display = 'none';
        this.showToast('Form cleared');
    }

    enableEditing() {
        this.isEditing = true;
        this.editablePrompt.value = this.currentPrompt;
        this.previewContent.style.display = 'none';
        this.editablePreview.style.display = 'block';
        this.editablePrompt.focus();
    }

    saveEdit() {
        this.currentPrompt = this.editablePrompt.value;
        this.previewContent.innerHTML = `<div class="generated-prompt">${this.escapeHtml(this.currentPrompt)}</div>`;
        this.cancelEdit();
        this.showToast('Changes saved');
    }

    cancelEdit() {
        this.isEditing = false;
        this.previewContent.style.display = 'block';
        this.editablePreview.style.display = 'none';
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
            this.showToast('Failed to copy to clipboard', 'error');
        }
    }

    downloadPrompt() {
        const prompt = this.finalPrompt.textContent;
        const blob = new Blob([prompt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `prompt-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Prompt downloaded!');
    }

    createNewPrompt() {
        this.clearForm();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showToast(message, type = 'success') {
        this.toastMessage.textContent = message;
        this.toast.className = `toast ${type}`;
        this.toast.classList.add('show');
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PromptGenerator();
});

// Add some example prompts for demonstration
const examples = {
    linkedin: {
        objective: "Write a friendly LinkedIn post announcing our team's move to a new office space",
        audience: "Working professionals and business contacts in our network",
        context: "We're a growing tech startup that just expanded to a larger office. We want to share our excitement while maintaining a professional image and building brand awareness.",
        constraints: "Keep it under 150 words, include emojis for visual appeal, mention our recent project launches",
        brandVoice: "friendly",
        cta: "engage",
        examples: "Use line breaks for readability, include relevant hashtags, maybe mention the team's excitement"
    },
    productReview: {
        objective: "Write a comprehensive product review for a new wireless headphone model",
        audience: "Tech enthusiasts and consumers looking for audio equipment recommendations",
        context: "This is for a tech blog audience who are interested in making informed purchasing decisions. The review should be thorough and trustworthy.",
        constraints: "1000-1500 words, objective tone with clear pros and cons, include technical specifications, comparison with competitors",
        brandVoice: "professional",
        cta: "learn",
        examples: "Structure: Introduction → Design & Build → Sound Quality → Features → Battery Life → Value for Money → Final Verdict"
    },
    email: {
        objective: "Draft a follow-up email to a potential client after a sales presentation",
        audience: "Enterprise decision-makers and stakeholders",
        context: "We presented our software solution to their team last week. They seemed interested but haven't responded yet. This is a B2B SaaS company selling to enterprise clients.",
        constraints: "Professional tone, concise but persuasive, include next steps, maximum 200 words",
        brandVoice: "confident",
        cta: "contact",
        examples: "Subject line should be specific, open with gratitude, address their key concerns mentioned in the meeting, provide clear next steps"
    }
};

// Add quick-fill functionality for examples
function addExampleButtons() {
    const examplesContainer = document.createElement('div');
    examplesContainer.className = 'examples-container';
    examplesContainer.innerHTML = `
        <div class="examples-header">
            <h4><i class="fas fa-lightbulb"></i> Quick Examples</h4>
        </div>
        <div class="examples-buttons">
            <button type="button" class="example-btn" data-example="linkedin">
                <i class="fab fa-linkedin"></i> LinkedIn Post
            </button>
            <button type="button" class="example-btn" data-example="productReview">
                <i class="fas fa-star"></i> Product Review
            </button>
            <button type="button" class="example-btn" data-example="email">
                <i class="fas fa-envelope"></i> Follow-up Email
            </button>
        </div>
    `;

    // Add CSS for example buttons
    const style = document.createElement('style');
    style.textContent = `
        .examples-container {
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9ff;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
        }
        .examples-header h4 {
            color: #4a5568;
            margin-bottom: 15px;
            font-size: 1rem;
            font-weight: 600;
        }
        .examples-buttons {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        .example-btn {
            padding: 8px 16px;
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            color: #4a5568;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .example-btn:hover {
            border-color: #667eea;
            color: #667eea;
            transform: translateY(-1px);
        }
        @media (max-width: 480px) {
            .examples-buttons {
                flex-direction: column;
            }
        }
    `;
    document.head.appendChild(style);

    // Insert after the form opening tag
    const form = document.getElementById('promptForm');
    form.insertBefore(examplesContainer, form.firstElementChild);

    // Add event listeners for example buttons
    examplesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('example-btn') || e.target.closest('.example-btn')) {
            const btn = e.target.classList.contains('example-btn') ? e.target : e.target.closest('.example-btn');
            const exampleKey = btn.dataset.example;
            const example = examples[exampleKey];
            
            if (example) {
                document.getElementById('objective').value = example.objective;
                document.getElementById('audience').value = example.audience || '';
                document.getElementById('context').value = example.context;
                document.getElementById('constraints').value = example.constraints;
                document.getElementById('brandVoice').value = example.brandVoice || '';
                document.getElementById('cta').value = example.cta || '';
                document.getElementById('examples').value = example.examples;
                
                // Trigger preview update
                const event = new Event('input', { bubbles: true });
                document.getElementById('objective').dispatchEvent(event);
                
                // Show toast
                const generator = window.promptGenerator || new PromptGenerator();
                generator.showToast(`Loaded ${btn.textContent.trim()} example`);
            }
        }
    });
}

// Add examples when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    addExampleButtons();
});
