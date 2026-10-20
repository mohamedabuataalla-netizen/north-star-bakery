"use strict";

// Two arrays organize the products and saved favorites.
const bakeryProducts = [
  { id: "loaf", name: "Signature Loaf", category: "Bread" },
  { id: "pastry", name: "Iced Pastry", category: "Pastries" },
  { id: "cake", name: "Celebration Cake", category: "Cakes" }
];

let favoriteIds = [];
let selectedCategory = "All";
let storageAvailable = true;

function loadPreferences() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("bakeryPreferences") || "{}"
    );

    if (!saved || typeof saved !== "object") return;

    if (Array.isArray(saved.favorites)) {
      favoriteIds = bakeryProducts
        .filter(product => saved.favorites.includes(product.id))
        .map(product => product.id);
    }

    const categories = ["All", "Bread", "Pastries", "Cakes"];

    if (categories.includes(saved.category)) {
      selectedCategory = saved.category;
    }
  } catch (error) {
    // The feature still works if saved data cannot be loaded.
    favoriteIds = [];
    selectedCategory = "All";
  }
}

function savePreferences() {
  try {
    const preferences = {
      favorites: favoriteIds,
      category: selectedCategory
    };

    localStorage.setItem(
      "bakeryPreferences",
      JSON.stringify(preferences)
    );
    storageAvailable = true;
  } catch (error) {
    storageAvailable = false;
  }

  updateStorageMessage();
}

function updateStorageMessage() {
  const message = document.getElementById("storage-message");

  if (message) {
    message.textContent = storageAvailable
      ? "Your category and favorites are remembered in this browser."
      : "Browser storage is unavailable. Selections work until you leave this page.";
  }
}

function toggleFavorite(productId) {
  if (favoriteIds.includes(productId)) {
    favoriteIds = favoriteIds.filter(id => id !== productId);
  } else {
    favoriteIds.push(productId);
  }

  savePreferences();
  renderProducts();
}

function renderProducts() {
  const list = document.getElementById("product-options");
  const summary = document.getElementById("favorites-summary");

  list.replaceChildren();

  const visibleProducts = bakeryProducts.filter(product =>
    selectedCategory === "All" ||
    product.category === selectedCategory
  );

  visibleProducts.forEach(product => {
    const item = document.createElement("li");
    const name = document.createElement("p");
    const button = document.createElement("button");
    const isFavorite = favoriteIds.includes(product.id);

    name.textContent = product.name;
    button.type = "button";
    button.textContent = isFavorite
      ? `Remove ${product.name} from favorites`
      : `Save ${product.name} to favorites`;

    button.setAttribute("aria-pressed", String(isFavorite));
    button.addEventListener("click", () => {
      toggleFavorite(product.id);
    });

    item.append(name, button);
    list.append(item);
  });

  const names = bakeryProducts
    .filter(product => favoriteIds.includes(product.id))
    .map(product => product.name);

  summary.textContent = names.length
    ? `Your favorites (${names.length}): ${names.join(", ")}.`
    : "You have no favorites yet.";
}

function setupFavorites() {
  const currentPage = document.querySelector(
    'nav a[aria-current="page"]'
  );

  if (
    !currentPage ||
    currentPage.getAttribute("href") !== "products.html"
  ) {
    return;
  }

  const section = document.createElement("section");

  section.id = "bakery-favorites";
  section.innerHTML = `
    <h2>Save your bakery favorites</h2>
    <p>Choose items to remember for your next visit.
       Saving a favorite does not place an order.</p>

    <label for="category-filter">Product category</label>
    <select id="category-filter">
      <option value="All">All products</option>
      <option value="Bread">Bread</option>
      <option value="Pastries">Pastries</option>
      <option value="Cakes">Cakes</option>
    </select>

    <ul id="product-options"></ul>
    <p id="favorites-summary" role="status"></p>
    <p id="storage-message"></p>
  `;

  document.getElementById("main-content").append(section);

  const filter = document.getElementById("category-filter");
  filter.value = selectedCategory;

  filter.addEventListener("change", () => {
    selectedCategory = filter.value;
    savePreferences();
    renderProducts();
  });

  renderProducts();
  updateStorageMessage();
}

loadPreferences();
setupFavorites();
// Add clear validation messages to the existing contact form.
function setupFormValidation() {
  const form = document.querySelector("form");
  if (!form) return;

  const fields = [
    {
      id: "name",
      label: "Name",
      minimum: 2,
      maximum: 100
    },
    {
      id: "email",
      label: "Email",
      minimum: 0,
      maximum: 254
    },
    {
      id: "details",
      label: "Item details or question",
      minimum: 10,
      maximum: 1500
    }
  ];

  const radios = Array.from(
    form.querySelectorAll('input[name="request_type"]')
  );

  function createError(element, errorId) {
    const message = document.createElement("p");
    message.id = errorId;
    message.className = "field-error";
    message.setAttribute("aria-live", "polite");
    element.insertAdjacentElement("afterend", message);

    const description =
      element.getAttribute("aria-describedby") || "";

    element.setAttribute(
      "aria-describedby",
      `${description} ${errorId}`.trim()
    );

    return message;
  }

  fields.forEach(field => {
    const input = document.getElementById(field.id);
    createError(input, `${field.id}-error`);
  });

  const radioGroup = radios[0].closest("fieldset");
  const requestError = document.createElement("p");
  requestError.id = "request-error";
  requestError.className = "field-error";
  requestError.setAttribute("aria-live", "polite");
  radioGroup.append(requestError);

  radios.forEach(radio => {
    radio.setAttribute("aria-describedby", "request-error");
  });

  const status = document.createElement("p");
  status.setAttribute("role", "status");
  form.append(status);

  function validateField(field) {
    const input = document.getElementById(field.id);
    const value = input.value.trim();
    let message = "";

    if (!value) {
      message = `${field.label} is required.`;
    } else if (value.length < field.minimum) {
      message =
        `Enter at least ${field.minimum} characters.`;
    } else if (value.length > field.maximum) {
      message =
        `Use no more than ${field.maximum} characters.`;
    } else if (
      field.id === "email" &&
      (
        input.validity.typeMismatch ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      )
    ) {
      message =
        "Enter an email address such as name@example.com.";
    }

    document.getElementById(
      `${field.id}-error`
    ).textContent = message;

    input.setAttribute(
      "aria-invalid",
      String(message !== "")
    );

    return message === "";
  }

  function validateRequestType() {
    const valid = radios.some(radio => radio.checked);

    requestError.textContent = valid
      ? ""
      : "Choose Preorder request or General question.";

    radios.forEach(radio => {
      radio.setAttribute("aria-invalid", String(!valid));
    });

    return valid;
  }

  let submitted = false;

  fields.forEach(field => {
    document.getElementById(field.id).addEventListener(
      "input",
      () => {
        status.textContent = "";
        if (submitted) validateField(field);
      }
    );
  });

  radios.forEach(radio => {
    radio.addEventListener("change", () => {
      status.textContent = "";
      if (submitted) validateRequestType();
    });
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    submitted = true;
    status.textContent = "";

    // Validate every field so all relevant messages appear.
    const results = fields.map(validateField);
    const requestValid = validateRequestType();

    if (results.includes(false) || !requestValid) {
      form.querySelector('[aria-invalid="true"]').focus();
      return;
    }

    // Also check the existing HTML constraints on other fields.
    if (!form.reportValidity()) return;

    status.textContent =
      "Your entries passed validation. This practice form " +
      "does not send a request or place an order.";
  });

  // JavaScript now displays errors beside the fields.
  form.noValidate = true;
}

setupFormValidation();