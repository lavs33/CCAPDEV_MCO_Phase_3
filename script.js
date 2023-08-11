
function showDropdownElements() {
    document.getElementById("myDropdown").classList.toggle("show");
}

window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
          }
      }
    }
}

function navigateToPage(selectElement, userId) {
  const selectedValue = selectElement.value;

  if (selectedValue === 'all') {
      window.location.href = `allposts/${userId}`;
  } 
}

function editProf(){

    var modal = document.getElementById("editModal");
    
    var btn = document.getElementById("edit");
    
    var span = document.getElementsByClassName("close")[0];
    
    function openModal() {
      modal.style.display = "block";
    }

    function closeModal() {
      modal.style.display = "none";
    }
    
    btn.addEventListener("click", openModal);
    
    span.addEventListener("click", closeModal);
    
    window.addEventListener("click", function (event) {
      if (event.target == modal) {
        closeModal();
      }
    });
}

document.getElementById("editForm").addEventListener("submit", function (event) {
   event.preventDefault();

   const formData = new FormData();
  
   const descriptionValue = document.getElementById("profile-description").value;
 
   const descriptionString = JSON.stringify({ description: descriptionValue });
 
   formData.append("profile-description", descriptionString);
 
   const profilePictureInput = document.getElementById("profile-picture");
   if (profilePictureInput.files.length > 0) {
     formData.append("profile-picture", profilePictureInput.files[0]);
   }
 
   const formAction = event.target.action;
 
    fetch(form.action, {
      method: "POST",
      body: formData,
    })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      closeModal();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

