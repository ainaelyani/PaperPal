const questionsContainer = document.getElementById('questionsContainer');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const submitBtn = document.getElementById('submitBtn');
const questionCountInput = document.getElementById('questionCount');

const toastEl = document.getElementById('toast');
const toastBody = document.getElementById('toastBody');
const toast = new bootstrap.Toast(toastEl, { delay: 2500 });

function notify(msg, colorClass = 'text-bg-primary') {
    toastEl.className = `toast align-items-center border-0 ${colorClass}`;
    toastBody.textContent = msg;
    toast.show();
}

function setSubmitEnabled() {
    submitBtn.disabled = questionsContainer.children.length === 0;
}

function buildLinesPreview(lines) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < lines; i++) {
        const div = document.createElement('div');
        div.className = 'line';
        frag.appendChild(div);
    }
    return frag;
}

function createQuestionCard(index) {
    const position = index + 1;

    const wrapper = document.createElement('div');
    wrapper.className = 'card question-card';

    const body = document.createElement('div');
    body.className = 'card-body';

    const header = document.createElement('div');
    header.className = 'd-flex justify-content-between align-items-start mb-3';
    header.innerHTML = `
        <div>
          <div class="badge text-bg-secondary">Question #${position}</div>
        </div>
        <button type="button" class="btn btn-sm btn-outline-danger" aria-label="Remove question ${position}">
          Remove
        </button>`;

    const removeBtn = header.querySelector('button');
    removeBtn.addEventListener('click', () => {
        wrapper.remove();
        renumberQuestions();
        setSubmitEnabled();
        notify(`Removed question #${position}`, 'text-bg-danger');
    });

    // Question text + marks
    const textGroup = document.createElement('div');
    textGroup.className = 'mb-3';
    textGroup.innerHTML = `
        <label class="form-label">Question text</label>
        <textarea class="form-control mb-2" name="question_text[]" rows="3" placeholder="Type the question..." required></textarea>
        <label class="form-label">Marks</label>
        <input type="number" class="form-control" name="marks[]" min="0" placeholder="e.g. 5">
      `;

    // Image + answer lines
    const row = document.createElement('div');
    row.className = 'row g-3';

    const imageCol = document.createElement('div');
    imageCol.className = 'col-md-6';
    imageCol.innerHTML = `
        <label class="form-label">Image (Optional)</label>
        <input type="file" class="form-control" name="image[]" accept="image/*">
        <img alt="Preview" class="img-fluid img-preview mt-2 d-none" />
        <div class="form-text">JPG/PNG recommended.</div>
      `;

    const linesCol = document.createElement('div');
    linesCol.className = 'col-md-6';
    linesCol.innerHTML = `
        <label class="form-label">Answer lines</label>
        <div class="input-group mb-2">
          <input type="number" class="form-control" name="answer_lines[]" value="5" min="0" max="60" step="1">
          <span class="input-group-text">lines</span>
        </div>
        <div class="lines-preview" aria-hidden="true"></div>
        <div class="form-text">Preview shows dashed lines that will become writing space in the PDF.</div>
      `;

    row.appendChild(imageCol);
    row.appendChild(linesCol);

    // Image preview
    const fileInput = imageCol.querySelector('input[type=file]');
    const imgPrev = imageCol.querySelector('img');
    let lastObjectURL = null;
    fileInput.addEventListener('change', (e) => {
        const [file] = e.target.files;
        if (file) {
            if (lastObjectURL) URL.revokeObjectURL(lastObjectURL);
            lastObjectURL = URL.createObjectURL(file);
            imgPrev.src = lastObjectURL;
            imgPrev.classList.remove('d-none');
        } else {
            if (lastObjectURL) URL.revokeObjectURL(lastObjectURL);
            imgPrev.src = '';
            imgPrev.classList.add('d-none');
        }
    });

    // Lines preview
    const linesInput = linesCol.querySelector('input[type=number]');
    const preview = linesCol.querySelector('.lines-preview');
    function refreshLines() {
        const n = Math.max(0, Math.min(60, parseInt(linesInput.value || '0', 10)));
        preview.innerHTML = '';
        preview.appendChild(buildLinesPreview(n));
    }
    linesInput.addEventListener('input', refreshLines);
    refreshLines();

    body.appendChild(header);
    body.appendChild(textGroup);
    body.appendChild(row);

    wrapper.appendChild(body);
    return wrapper;
}

function renumberQuestions() {
    [...questionsContainer.querySelectorAll('.badge')].forEach((badge, i) => {
        badge.textContent = `Question #${i + 1}`;
    });
}

function generateQuestions(count) {
    if (!Number.isInteger(count) || count < 1 || count > 100) {
        notify('Please enter a valid number between 1 and 100.', 'text-bg-warning');
        return;
    }
    if (questionsContainer.children.length > 0) {
        const ok = confirm('This will replace existing inputs. Continue?');
        if (!ok) return;
    }
    questionsContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
        questionsContainer.appendChild(createQuestionCard(i));
    }
    renumberQuestions();
    setSubmitEnabled();
    notify(`Generated ${count} question input${count > 1 ? 's' : ''}.`, 'text-bg-success');
}

generateBtn.addEventListener('click', () => {
    const count = parseInt(questionCountInput.value, 10);
    generateQuestions(count);
});

clearBtn.addEventListener('click', () => {
    questionsContainer.innerHTML = '';
    setSubmitEnabled();
    notify('Cleared all question inputs.', 'text-bg-secondary');
});

document.getElementById('examForm').addEventListener('submit', (e) => {
    if (questionsContainer.children.length === 0) {
        e.preventDefault();
        notify('Please generate at least one question first.', 'text-bg-warning');
    }
});