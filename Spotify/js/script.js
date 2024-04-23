let currentSong=new Audio();
let songs;
let currFolder;

async function getSongs(folder) {
    currFolder=folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

     //show all the songs in playlist
     let songUl=document.querySelector(".songslist").getElementsByTagName("ul")[0];
     songUl.innerHTML="";
     for (const song of songs) {
         songUl.innerHTML=songUl.innerHTML+ `<li>
         <img src="image/music.svg" alt="">
         <div class="info">
             <div>${song.replaceAll("%20"," ")}</div>
         </div>
         <div class="playnow">
             <span>Play Now</span>
         <img class="invert" src="image/play.svg" alt="">
         </div>
     </li>`;
     }
 
     //Attach an eventListener to each song
     Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach(e=>{
         e.addEventListener("click",element=>{
         // console.log(e.querySelector(".info").firstElementChild.innerHTML);
         playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        }) 
     })

     return songs;
}

function secondsToMinutesSeconds(totalSeconds) {
    if(isNaN(totalSeconds) || totalSeconds<0){
        return "00:00";
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60); // Convert seconds to integer

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0'); // Ensure two digits

    return `${formattedMinutes}:${formattedSeconds}`;
}

const playMusic=(track,pause=false)=>{
    // let audio=new Audio("/songs/"+track);
    currentSong.src=`/${currFolder}/`+track;
    if(!pause){
        currentSong.play();
        Play.src="image/pause.svg";
    } 
    document.querySelector(".songname").innerHTML=decodeURI(track);
    document.querySelector(".songtime").innerHTML="00:00/00:00";
}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors=div.getElementsByTagName("a");
    let array=Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder= e.href.split("/").slice(-2)[0];
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
            let cardContainer=document.querySelector(".cardContainer")
            cardContainer.innerHTML=cardContainer.innerHTML + `<div data-folder="${folder}" class="card rounded">
            <div class="circular-box">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                    color="#000000" fill="black">
                    <path
                        d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                        stroke="black" stroke-width="1.5" stroke-linejoin="round" />
                </svg>
            </div>
            <img class="rounded" src="/songs/${folder}/cover.jpg"
                alt="">
            <h4>${response.title}</h4>
            <p>${response.description}...</p>
        </div>`
        }
    }
    //load the playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        // console.log(e);
        e.addEventListener("click",async item=>{
            //item.target se jis pr click kro like image p wo milega pr currenttarget se jis pr eventlistener lga hua wo milega
            // console.log(item,item.currentTarget.dataset);
            songs=await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);

        })
    })
}

async function main() {
    //get list of all songs
    songs = await getSongs("songs/srk");
    playMusic(songs[0],true);
    // console.log(songs);


    //display all the albums on page
    displayAlbums();
   

    //Attach an eventlistener to play next and previous
    Play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play();
            Play.src="image/pause.svg";
        }
        else{
            currentSong.pause()
            Play.src="image/play.svg";

        }
    })

    // listen for time update 
    currentSong.addEventListener("timeupdate",()=>{
        // console.log(currentSong.currentTime,currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left=(currentSong.currentTime/ currentSong.duration)* 100 + "%";
    })

    //add eventlistener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        // console.log(e.target.getBoundingClientRect(),e.offsetX);
        let percent=(e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left=percent + "%";
        currentSong.currentTime=((currentSong.duration)*percent)/100;
    })

    //add and eventlistener for hamburger
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0";
    })

    //add and eventlistener for close
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-110%";
    })

    //add and event listener to previous
    previous.addEventListener("click",()=>{
        currentSong.pause();
        console.log("Previous Clicked!");

        let index=songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if((index-1)>=0){
            playMusic(songs[index-1]);
        }

    })

    //add and event listener to next
    next.addEventListener("click",()=>{
        currentSong.pause();
        console.log("Next Clicked!");

        let index=songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if((index+1)<songs.length){
            playMusic(songs[index+1]);
        }
    })

    //add event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        console.log("setting volume to",e.target.value);
        currentSong.volume=parseInt(e.target.value)/100;
    })

    //add event listner to mute the track
    document.querySelector(".volume>img").addEventListener("click",(e)=>{
        // console.log(e.target);
        if(e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("volume.svg","mute.svg");
            currentSong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{
            e.target.src=e.target.src.replace("mute.svg","volume.svg");
            currentSong.volume=.20;
            document.querySelector(".range").getElementsByTagName("input")[0].value=20;
        }
    }) 
     
}

main();

