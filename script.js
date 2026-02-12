// Form Validation Functions
function validateName(name) {
  if (!name.trim()) return "Name is required";
  if (name.length < 2) return "Name must be at least 2 characters";
  if (name.length > 50) return "Name must be less than 50 characters";
  if (!/^[a-zA-Z\s]+$/.test(name))
    return "Name should only contain letters and spaces";
  return "";
}

function validateEmail(email) {
  if (!email.trim()) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return "";
}

function validateSubject(subject) {
  if (!subject.trim()) return "Subject is required";
  if (subject.length < 5) return "Subject must be at least 5 characters";
  if (subject.length > 100) return "Subject must be less than 100 characters";
  return "";
}

function validateMessage(message) {
  if (!message.trim()) return "Message is required";
  if (message.length < 10) return "Message must be at least 10 characters";
  if (message.length > 1000) return "Message must be less than 1000 characters";
  return "";
}

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorSpan = document.getElementById(fieldId + "-error");

  field.classList.add("error");
  field.classList.remove("success");
  errorSpan.textContent = message;
  errorSpan.classList.add("show");
}

function showSuccess(fieldId) {
  const field = document.getElementById(fieldId);
  const errorSpan = document.getElementById(fieldId + "-error");

  field.classList.add("success");
  field.classList.remove("error");
  errorSpan.classList.remove("show");
}

function clearValidation(fieldId) {
  const field = document.getElementById(fieldId);
  const errorSpan = document.getElementById(fieldId + "-error");

  field.classList.remove("error", "success");
  errorSpan.classList.remove("show");
}

function validateField(fieldId) {
  const field = document.getElementById(fieldId);
  const value = field.value;
  let errorMessage = "";

  switch (fieldId) {
    case "name":
      errorMessage = validateName(value);
      break;
    case "email":
      errorMessage = validateEmail(value);
      break;
    case "subject":
      errorMessage = validateSubject(value);
      break;
    case "message":
      errorMessage = validateMessage(value);
      break;
  }

  if (errorMessage) {
    showError(fieldId, errorMessage);
    return false;
  } else if (value.trim()) {
    showSuccess(fieldId);
    return true;
  } else {
    clearValidation(fieldId);
    return false;
  }
}

function validateForm() {
  const fields = ["name", "email", "subject", "message"];
  let isValid = true;

  fields.forEach((fieldId) => {
    if (!validateField(fieldId)) {
      isValid = false;
    }
  });

  return isValid;
}

// Toast Notification Functions
function createToast(type, title, message) {
  const toastContainer = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  toast.innerHTML = `
    <div class="toast-header">
      <span class="toast-title">${title}</span>
      <button class="toast-close" aria-label="Close">&times;</button>
    </div>
    <div class="toast-message">${message}</div>
    <div class="toast-progress"></div>
  `;
  
  // Add close functionality
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    removeToast(toast);
  });
  
  toastContainer.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    removeToast(toast);
  }, 5000);
  
  return toast;
}

function removeToast(toast) {
  toast.classList.remove('show');
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 400);
}

function showSuccessToast(data) {
  const message = `Your message has been sent successfully!\n\nName: ${data.name}\nEmail: ${data.email}\nSubject: ${data.subject}`;
  createToast('success', 'Message Sent', message);
}

function showErrorToast(message = 'There was an error submitting your form. Please try again.') {
  createToast('error', 'Submission Failed', message);
}

function showValidationToast() {
  createToast('error', 'Validation Error', 'Please fix the errors in the form before submitting.');
}

// Contact Form Handler for Formspree with Validation
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contactForm");
  const fields = ["name", "email", "subject", "message"];

  // Add real-time validation on blur
  fields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);

    field.addEventListener("blur", function () {
      if (this.value.trim()) {
        validateField(fieldId);
      }
    });

    field.addEventListener("input", function () {
      if (this.classList.contains("error") && this.value.trim()) {
        validateField(fieldId);
      }
    });
  });

  // Form submission handler
  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent default form submission

    // Validate all fields
    if (!validateForm()) {
      showValidationToast();
      return;
    }

    const formData = new FormData(form);

    // Show loading state
    const submitBtn = form.querySelector(".form-submit-btn");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;

    // Submit to Formspree
    fetch(form.action, {
      method: form.method,
      body: formData,
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          // Success - show toast with form data
          const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
          };
          
          showSuccessToast(data);
          form.reset();

          // Clear all validation states
          fields.forEach((fieldId) => {
            clearValidation(fieldId);
          });
        } else {
          response.json().then((data) => {
            const errorMsg = data.errors 
              ? data.errors.map(error => error.message).join(', ')
              : 'There was a problem submitting your form.';
            showErrorToast(errorMsg);
            console.error("Form submission error:", data);
          });
        }
      })
      .catch((error) => {
        showErrorToast();
        console.error("Form submission error:", error);
      })
      .finally(() => {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      });
  });
});
