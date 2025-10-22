// ...existing code...
const  chatbody=document.querySelector(".chatbody");

const messageInput=document.querySelector(".message-input");

const sendButton=document.querySelector("#send-message");

const uploadButton=document.querySelector("#upload");

const uploadwrap=document.querySelector(".upload-wrap");

const cancelUpload=document.querySelector("#cancel-upload");

const openchat=document.querySelector("#open-chat");

const closechat=document.querySelector("#close-chat");

const chatbotPopup=document.querySelector(".chatbot-popup");

//API details
const API_KEY="AIzaSyA-eeLW0uNR3UQ7Gm9rbR623XfSujFYb28";
const API_URL=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const userdata ={
  usermessage: null,
  file:{
    data:null,
    mime_type:null
  }
}

const chatHistory=[];

// safer initial height (guard if element not found)
const initialheight = messageInput ? (messageInput.scrollHeight || messageInput.clientHeight || 24) : 24;

// utility to auto-resize textarea (keeps same style)
function autoResize(ta){
  if(!ta) return;
  // reset then grow to content up to max
  ta.style.height = 'auto';
  const max = 180;
  const newH = Math.min(ta.scrollHeight, max);
  ta.style.height = newH + "px";
  // toggle form radius same as before
  const form = document.querySelector(".chat-form");
  if(form) form.style.borderRadius = (ta.scrollHeight > initialheight) ? "15px" : "32px";
}
// ...existing code...

const createMessageElement=(content,classes)=>{
  const messageElement=document.createElement("div");
  messageElement.classList.add("message", classes);
  messageElement.innerHTML=content;
  return messageElement;
}

// ...existing code...
const generateResponse= async(incomingMessageDiv)=>{
  const messageElement=incomingMessageDiv.querySelector(".message-text");
  chatHistory.push({role:"user",parts: [
          {text: userdata.usermessage},...(userdata.file.data ? [{inline_data:userdata.file}] : [])
        ]});

  const requestOptions={
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body: JSON.stringify({
      contents:chatHistory,
    })
  }
  try {
    const response=await fetch(API_URL,requestOptions);
    const data=await response.json();
    if (!response.ok)throw new Error(data.error.message);{
      
    }
    const apiresponse=data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
    messageElement.textContent=apiresponse;

    chatHistory.push({role:"model",parts: [
          {text: userdata.usermessage},...(userdata.file.data ? [{inline_data:userdata.file}] : [])
        ]});
  } catch (error) {
    console.error("Error:", error);
    messageElement.innerHTML="Api Key Not a valid please pass a valid key";
    messageElement.style.color="red";
  }finally{
    userdata.file={};
    incomingMessageDiv.classList.remove("thinking");
    chatbody.scrollTo({top: chatbody.scrollHeight, behavior:"smooth"});
  }
};
// ...existing code...

const handleoutgoingMessage = (e)=>{
  e.preventDefault();
  userdata.usermessage=messageInput.value.trim();
  messageInput.dispatchEvent(new Event("input"));
  const messageContent=`<div class="message-text"></div>
  ${userdata.file.data ?`<img src="data:${userdata.file.mime_type};base64,${userdata.file.data}" alt="user-upload" class="user-uploaded-image">` : ""}`;
  const outgoingMessageDiv= createMessageElement(messageContent, "user-message")
  outgoingMessageDiv.querySelector(".message-text").textContent=userdata.usermessage;
  messageInput.value="";
  // reset/resize textarea after sending
  autoResize(messageInput);
  chatbody.appendChild(outgoingMessageDiv);
  chatbody.scrollTo({top: chatbody.scrollHeight, behavior:"smooth"});

  setTimeout(() => {
   const messageContent=`<svg xmlns="http://www.w3.org/2000/svg"  class="bot-logo"   width="50" height="50" viewBox="0 0 1024 1024">
        <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
        </svg>
           
        <div class="message-text">
        <div class="thinking-indicator">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        </div>
        </div>`;
  const incomingMessageDiv= createMessageElement(messageContent, "bot-message");
  chatbody.appendChild(incomingMessageDiv);
  chatbody.scrollTo({top: chatbody.scrollHeight, behavior:"smooth"});
  generateResponse(incomingMessageDiv);
  }, 600);

}

// ...existing code...

messageInput.addEventListener("keydown", (e)=>
{
  const userMessage=e.target.value.trim();
  // send on Enter, allow newline with Shift+Enter
  if (e.key==="Enter" && !e.shiftKey && window.innerWidth>768) {
    e.preventDefault();
    handleoutgoingMessage(e);
  }

}
);

// replace previous input logic with autoResize
messageInput.addEventListener("input", () => {
  autoResize(messageInput);
})

 // ensure initial sizing when script loads
autoResize(messageInput);

// ...existing code...
uploadButton.addEventListener("change", () => {
  
  const file=uploadButton.files[0];

  if(!file)return;

  const reader=new FileReader();


  reader.onload =  (e) => {
   
    uploadwrap.querySelector("img").src=e.target.result;
    uploadwrap.querySelector("img").style.display="block";

    uploadwrap.querySelector("#cancel-upload").style.display="block";
    const base64Data=e.target.result.split(",")[1];
   

    userdata.file={
    data:base64Data,
    mime_type:file.type
  }
    uploadButton.value="";
  }

  reader.readAsDataURL(file);
  
  });

cancelUpload.addEventListener("click", () => {
  userdata.file={};
  uploadwrap.querySelector("img").src="#";
  uploadwrap.querySelector("img").style.display="none";
  cancelUpload.style.display="none";
});

// ...existing code...
const picker = new EmojiMart.Picker({
  theme:"dark",
  skinTonePosition: "none",
  previewPosition: "none",

  onEmojiSelect: (emoji)=>{
    const {selectionStart:start,selectionEnd:end}=messageInput;
    messageInput.setRangeText(emoji.native,start.end,"end");
    messageInput.focus();
    // resize after inserting emoji
    autoResize(messageInput);
  },

  onClickOutside: (e) => {
    if (e.target.id==="emoji") {
      document.body.classList.toggle("show-emoji-picker");
    }else{
      document.body.classList.remove("show-emoji-picker");
    }  
  }
})

document.querySelector(".chat-form").appendChild(picker);

// ensure sendButton doesn't trigger native submit and uses same handler
sendButton.addEventListener("click",(e)=> {
  e.preventDefault();
  handleoutgoingMessage(e);
});

// ...existing code...
document.querySelector("#file-upload").addEventListener("click", () => uploadButton.click());

openchat.addEventListener("click", () => {
document.body.classList.toggle("show-chatbot")
});

closechat.addEventListener("click", () => {
  document.body.classList.remove("show-chatbot");
})
// ...existing code...
// ...existing code...
// ensure textarea focus only when clicking the textarea (not icons)
const chatForm = document.querySelector(".chat-form");
if (chatForm) {
  chatForm.addEventListener("click", (ev) => {
    // focus only if the click target is the textarea itself
    if (ev.target === messageInput) {
      messageInput.focus();
    }
    // do nothing when icons/buttons are clicked
  });
}

const chat = document.querySelector(".chat-form");

// ensure form never triggers native validation/submit and buttons don't submit
if (chatForm) {
  chatForm.noValidate = true;
  chatForm.addEventListener("submit", (e) => e.preventDefault());
  chatForm.querySelectorAll("button").forEach(btn => btn.type = "button");
}
// ...existing code...