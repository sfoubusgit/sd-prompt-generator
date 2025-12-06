import { useNavigate } from 'react-router-dom';
import './TutorialPage.css';

export function TutorialPage() {
  const navigate = useNavigate();

  return (
    <div className="tutorial-page">
      <div className="tutorial-container">
        <div className="tutorial-header">
          <h1>Welcome to the Prompt Generator Tutorial</h1>
          <p className="tutorial-subtitle">
            Learn how to create high-quality Stable Diffusion prompts through our guided interview system
          </p>
          <button className="tutorial-back-button" onClick={() => navigate('/')}>
            ← Back to Generator
          </button>
        </div>

        <div className="tutorial-content">
          <section className="tutorial-section">
            <h2>🎯 What is This Tool?</h2>
            <p>
              The Guided Prompt Interview Creator helps you build complex and nuanced Stable Diffusion prompts 
              through an interactive question-and-answer system. Instead of manually constructing prompts, 
              you'll answer structured questions that guide you through creating detailed, weighted prompts.
            </p>
          </section>

          <section className="tutorial-section">
            <h2>📋 Getting Started</h2>
            <div className="tutorial-step">
              <h3>1. Start the Interview</h3>
              <p>
                When you begin, you'll see the first question: "What are you imagining?" 
                Select an answer to start building your prompt.
              </p>
            </div>
            <div className="tutorial-step">
              <h3>2. Navigate Through Questions</h3>
              <p>
                Each answer leads to the next question. The system adapts based on your choices, 
                creating a personalized path through the interview.
              </p>
            </div>
            <div className="tutorial-step">
              <h3>3. Use Navigation Buttons</h3>
              <ul>
                <li><strong>Back:</strong> Return to the previous question</li>
                <li><strong>Suggest for Me:</strong> Auto-select the first answer option</li>
                <li><strong>Next:</strong> Move forward when you've made a selection</li>
                <li><strong>Skip:</strong> Skip the current question if available</li>
                <li><strong>Add:</strong> Commit your current selection and move forward</li>
              </ul>
            </div>
          </section>

          <section className="tutorial-section">
            <h2>✨ Key Features</h2>
            
            <div className="tutorial-feature">
              <h3>📝 Answer Selection</h3>
              <p>
                Click on any answer button to select it. Selected answers are highlighted. 
                You can change your selection before committing it.
              </p>
            </div>

            <div className="tutorial-feature">
              <h3>🔍 Refinement Questions</h3>
              <p>
                After selecting an answer, you may see refinement questions that help you 
                specify details more precisely. For example, if you select "Curly hair", 
                you might be asked "How curly?" with options like "Defined curls" or "Loose waves".
              </p>
            </div>

            <div className="tutorial-feature">
              <h3>⚖️ Weight Sliders</h3>
              <p>
                Weight sliders let you fine-tune the intensity of attributes in your prompt. 
                Adjust the slider to increase or decrease how strongly a feature appears. 
                The value is displayed next to the slider and updates your prompt in real-time.
              </p>
              <p className="tutorial-note">
                💡 Tip: Weights are formatted as <code>(attribute:value)</code> in your final prompt, 
                allowing for precise control over each element.
              </p>
            </div>

            <div className="tutorial-feature">
              <h3>👁️ Live Preview</h3>
              <p>
                The preview panel on the right side shows your prompt as you build it. 
                It updates in real-time as you make selections, adjust weights, or add custom elements.
              </p>
              <ul>
                <li><strong>Prompt:</strong> Your main positive prompt</li>
                <li><strong>Negative Prompt:</strong> Elements to avoid in the generated image</li>
              </ul>
            </div>

            <div className="tutorial-feature">
              <h3>📊 Selection Summary</h3>
              <p>
                The Selection Summary panel shows all your committed selections. 
                You can click on any item to jump back to that question, or remove selections 
                you no longer want.
              </p>
            </div>

            <div className="tutorial-feature">
              <h3>➕ Custom Prompt Elements</h3>
              <p>
                Add your own custom text, tags, or weighted elements to the prompt. 
                You can toggle them on/off and set their type (positive or negative).
              </p>
            </div>

            <div className="tutorial-feature">
              <h3>🗂️ Category Sidebar</h3>
              <p>
                The left sidebar shows all available categories. Categories with selections 
                are highlighted. Click on any category to jump directly to that section.
              </p>
            </div>
          </section>

          <section className="tutorial-section">
            <h2>🔄 Workflow Example</h2>
            <div className="tutorial-workflow">
              <ol>
                <li>Start with "What are you imagining?" → Select "A character"</li>
                <li>Answer "What gender?" → Select "Female"</li>
                <li>Answer "What age?" → Select "Young adult"</li>
                <li>Answer "What is the hair like?" → Select "Curly"</li>
                <li>Refinement: "How curly?" → Select "Defined curls"</li>
                <li>Adjust "Curl Intensity" slider → Set to 1.18</li>
                <li>Continue through environment, style, and composition questions</li>
                <li>Review your prompt in the preview panel</li>
                <li>Copy the final prompt for use in Stable Diffusion</li>
              </ol>
            </div>
          </section>

          <section className="tutorial-section">
            <h2>💡 Tips & Best Practices</h2>
            <ul className="tutorial-tips">
              <li>
                <strong>Take your time:</strong> The interview is designed to be thorough. 
                Don't rush through questions.
              </li>
              <li>
                <strong>Use refinements:</strong> When available, refinement questions help 
                create more specific and detailed prompts.
              </li>
              <li>
                <strong>Adjust weights carefully:</strong> Small changes to weights can have 
                significant effects on the final image.
              </li>
              <li>
                <strong>Review your selections:</strong> Use the Selection Summary to review 
                and modify your choices before finalizing.
              </li>
              <li>
                <strong>Experiment:</strong> Try different combinations and see how they affect 
                your prompt in real-time.
              </li>
              <li>
                <strong>Use custom elements:</strong> Add specific details that aren't covered 
                by the interview questions.
              </li>
            </ul>
          </section>

          <section className="tutorial-section">
            <h2>❓ Frequently Asked Questions</h2>
            
            <div className="tutorial-faq">
              <h3>Can I go back and change my answers?</h3>
              <p>
                Yes! Use the "Back" button to return to previous questions, or click on items 
                in the Selection Summary to jump directly to them.
              </p>
            </div>

            <div className="tutorial-faq">
              <h3>What happens if I skip a question?</h3>
              <p>
                Skipping a question moves you forward without adding that element to your prompt. 
                You can always go back later if you change your mind.
              </p>
            </div>

            <div className="tutorial-faq">
              <h3>How do I reset and start over?</h3>
              <p>
                When you reach the end of the interview, you'll see a "Reset" button in the 
                preview panel. Click it to start a new interview.
              </p>
            </div>

            <div className="tutorial-faq">
              <h3>Can I edit the prompt directly?</h3>
              <p>
                The prompt is generated automatically from your selections. However, you can 
                add custom elements to include specific details not covered by the interview.
              </p>
            </div>
          </section>

          <section className="tutorial-section tutorial-footer">
            <h2>🚀 Ready to Start?</h2>
            <p>
              You're now ready to create amazing prompts! Click the button below to return 
              to the generator and start your first interview.
            </p>
            <button className="tutorial-start-button" onClick={() => navigate('/')}>
              Start Creating Prompts
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

