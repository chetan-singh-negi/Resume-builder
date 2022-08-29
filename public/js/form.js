const input = document.querySelector('#workexperience');
const addButton = document.querySelector('#exp');
const list = document.querySelector('#exp-list');


function appendOnExperience(userInput){
  const existingHtml = list.innerHTML;
  list.innerHTML = `${existingHtml}<li>${userInput}</li>`;
  input.value=''

}


function executeOnClickAddExpButton(event){
    event?.preventDefault();
  const userInput= input.value;
  if (userInput && userInput.length > 0){
  appendOnExperience(userInput);
  }

  
}

addButton.addEventListener('click',executeOnClickAddExpButton);

