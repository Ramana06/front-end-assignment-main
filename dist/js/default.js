const phoneRegex = /^[0-9]{10}$/;
// eslint-disable-next-line no-useless-escape
const emailRegex =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\].,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
const validationMessages = {};

async function fetchQuestions() {
  try {
    const response = await fetch(
      "https://mocki.io/v1/84954ef5-462f-462a-b692-6531e75c220d"
    );
    if (!response.ok) {
      throw new Error("Failed to fetch questions");
    }
    const questions = await response.json();
    renderForm(questions);
  } catch (error) {
    console.error(error);
  }
}

// Render the form based on the questions
function renderForm(questions) {
  const form = document.getElementById("userForm");
  const fieldset = document.createElement("fieldset");
  const legend = document.createElement("legend");
  legend.textContent = "Personal Information Form";
  fieldset.appendChild(legend);

  questions.forEach((question, index) => {
    if (question.type === "radio") {
      const radioGroup = document.createElement("div");
      radioGroup.className = "radio-group";

      question.options.forEach((option) => {
        const radioInput = document.createElement("input");
        radioInput.type = "radio";
        radioInput.name = question.name;
        radioInput.value = option.value;
        radioInput.id = option.id;

        const label = document.createElement("label");
        label.textContent = option.label;
        label.htmlFor = option.id;

        radioGroup.appendChild(radioInput);
        radioGroup.appendChild(label);
      });

      fieldset.appendChild(radioGroup);
    } else {
      const label = document.createElement("label");
      label.textContent = question.label;
      label.htmlFor = question.id;

      const input = document.createElement("input");
      input.type = question.type;
      input.name = question.name;
      input.id = question.id;
      input.required = question.required === 1;

      input.onblur = function () {
        validateInput(input, question);
      };

      if (question.pattern) {
        input.pattern = question.pattern;
      }

      fieldset.appendChild(label);
      fieldset.appendChild(input);

      const span = document.createElement("span");
      span.id = question.id + "-span"; // Create a unique ID for the span
      span.className = "validation-message";
      span.style = "color:red";

      fieldset.appendChild(span);
      validationMessages[question.id] = span;
      // Add an extra line break if it's not the last field
      if (index < questions.length - 1) {
        fieldset.appendChild(document.createElement("br"));
      }
    }
  });

  form.appendChild(fieldset);
  function validateInput(input, question) {
    const spanId = question.id + "-span";
    const span = document.getElementById(spanId);

    // Clear any previous error messages
    span.textContent = "";
    span.classList.remove("error");

    if (
      question.name === "contactPhone" &&
      input.value !== "" &&
      !phoneRegex.test(input.value)
    ) {
      span.textContent = "Please enter a valid phone number.";
    }
    if (
      question.name === "contactEmail" &&
      input.value !== "" &&
      !emailRegex.test(input.value)
    ) {
      span.textContent = "Please enter a valid email address.";
    }
    if (input.checkValidity()) {
      // Input is valid, thre is no need of further validation
      return;
    }

    // Check specific validations for nameFirst, nameLast, and preferredContact
    if (question.name === "nameFirst") {
      span.textContent = "Please enter a valid first name.";
    } else if (question.name === "nameLast") {
      span.textContent = "Please enter a valid last name.";
    } else if (question.name === "preferredContact") {
      span.textContent = "Please select a preferred contact.";
    }
    span.classList.add("error");
  }

  // Submit form data to the backend
  document
    .getElementById("submitBtn")
    .addEventListener("click", async function (event) {
      event.preventDefault();
      const form = document.getElementById("userForm");
      let formIsValid = true;
      for (const id in validationMessages) {
        const input = document.getElementById(id);
        const question = questions.find((q) => q.id === id);
        validateInput(input, question);
        if (input.checkValidity() === false) {
          formIsValid = false;
        }
      }

      if (formIsValid) {
        const formData = new FormData(form);
        const data = [];

        formData.forEach((value, name) => {
          const obj = {
            name: name,
            value: value,
          };
          data.push(obj);
        });

        try {
          const response = await fetch(
            "https://0211560d-577a-407d-94ab-dc0383c943e0.mock.pstmn.io/submitform",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            }
          );

          if (response.status === 200) {
            resetErrorMessage();
            const errorMessages = document.getElementById("successMessage");
            errorMessages.textContent = "Form submitted successfully";
            // alert('Form submitted successfully');
          } else {
            resetSuccessMessage();
            const errorMessages = document.getElementById("errorMessages");
            errorMessages.textContent = "Form submission failed";
            throw new Error("Form submission failed");
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        resetSuccessMessage();
        const errorMessages = document.getElementById("errorMessages");
        errorMessages.textContent =
          "Please fill out the required fields correctly.";
      }
    });

  function resetSuccessMessage() {
    const errorMessages = document.getElementById("successMessage");
    errorMessages.textContent = "";
  }
  function resetErrorMessage() {
    const errorMessages = document.getElementById("errorMessages");
    errorMessages.textContent = "";
  }
}

// Fetch questions when the page loads
fetchQuestions();
