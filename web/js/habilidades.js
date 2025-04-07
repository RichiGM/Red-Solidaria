  const editBtn = document.querySelector('.edit-btn');
  const modal = document.getElementById("skillsModal");
  const closeBtn = document.querySelector(".close");
  const skillsList = document.getElementById("skillsList");
  const saveBtn = document.getElementById("saveSkills");
  const searchInput = document.getElementById("searchSkill");
  const skillsContainer = document.getElementById("skills-container");

  let allSkills = []; // Se llenará desde la base de datos
  let selectedSkills = []; // [{ id, nombre }]

  // Abrir modal y cargar habilidades
  editBtn.addEventListener("click", async () => {
    await fetchSkillsFromDB();
    renderSkillList(allSkills);
    modal.style.display = "block";
  });

  // Cerrar modal
  closeBtn.onclick = () => modal.style.display = "none";
  window.onclick = (event) => {
    if (event.target === modal) modal.style.display = "none";
  };

  // Obtener habilidades desde el backend
  async function fetchSkillsFromDB() {
    try {
      const response = await fetch("/api/habilidades");
      allSkills = await response.json();
    } catch (error) {
      console.error("Error al obtener habilidades:", error);
    }
  }

  // Renderizar lista con selección
  function renderSkillList(filteredSkills) {
    skillsList.innerHTML = "";
    filteredSkills.forEach(skill => {
      const li = document.createElement("li");
      li.textContent = skill.nombre;

      if (selectedSkills.some(s => s.id === skill.id)) {
        li.classList.add("selected");
      }

      li.addEventListener("click", () => {
        if (selectedSkills.some(s => s.id === skill.id)) {
          selectedSkills = selectedSkills.filter(s => s.id !== skill.id);
          li.classList.remove("selected");
        } else {
          selectedSkills.push(skill);
          li.classList.add("selected");
        }
      });

      skillsList.appendChild(li);
    });
  }

  // Filtrar habilidades mientras se escribe
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const filtered = allSkills.filter(skill => skill.nombre.toLowerCase().includes(query));
    renderSkillList(filtered);
  });

  // Guardar selección
  saveBtn.addEventListener("click", () => {
    modal.style.display = "none";
    renderSelectedSkills();
  });

  function renderSelectedSkills() {
    skillsContainer.innerHTML = "";
    selectedSkills.forEach(skill => {
      const span = document.createElement("span");
      span.classList.add("skill-tag");
      span.textContent = skill.nombre;
      skillsContainer.appendChild(span);
    });
  }

