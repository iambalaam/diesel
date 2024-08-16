const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext('2d');

let spriteWidth = undefined;
let spriteHeight = undefined;

const uploadButton = document.getElementById('upload');
function handleChange(inputEvent) {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0)
        }
        img.src = readerEvent.target.result;
    }
    reader.readAsDataURL(inputEvent.target.files[0])
}
uploadButton.addEventListener('change', handleChange)
