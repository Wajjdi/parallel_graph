import { Component, Host, h, Prop, State } from '@stencil/core';

@Component({
  tag: 'fetch-data',
  styleUrl: 'fetch-data.css',
  shadow: true,
})
export class FetchData {
  @Prop() artist;

  // Constain valuable information to use in the parallel graph
  @State() dataObj = {artist:""};
  @State() dataObjInt;

  componentDidLoad() {
    this.analyseData();
    this.convertLengthToInt();
    this.getSongs(this.dataObj);
    this.getDataPhaseA(this.dataObj);
  }

  public httpGet(url: string): string {
    let xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", url, false);
    xmlHttpReq.send(null);
    return xmlHttpReq.responseText;
  }
  public getData(): string {
    try {
      let data = this.httpGet("https://wasabi.i3s.unice.fr/api/v1/artist_all/name/" + this.artist)
      return data;
    }
    catch (error) {
      alert("Data not received due to : " + error);
    }
  }

  public getStats(data: object): object {
    let stats = {};

    // % missing data

    return stats;
  }

  public analyseData() {

    let json = JSON.parse(this.getData());
    this.artist = json["name"];

    let albums = json["albums"];

    albums.forEach(album => {
      let songs = album["songs"];
      let index = 1;
      let globalGenre = album["genre"];

      songs.forEach(song => {
        let songObj = { id: "", title: "", length: "", language: "", isClassic: "" };

        songObj.id = song["_id"];
        songObj.title = song["title"];
        songObj.isClassic = song["isClassic"];

        // We test if lenght is defined 
        if (song["length"] != "") {
          songObj.length = song["length"];
        }
        else {
          songObj.length = undefined;
        }

        // We test if genre is defined in the song otherwise we use album genre
        if ((song.hasOwnProperty("genre")) && (song["genre"].length > 0)) {
          let genreArray = song["genre"];
          let genre = {};
          let i = 0;
          genreArray.forEach(g => {
            genre[i] = g;
            i++;
          });
          songObj["genre"] = genre;
        }
        else {
          if (globalGenre != "") {
            songObj["genre"] = globalGenre;
          }
          else {
            songObj["genre"] = undefined;
          }
        }

        // We test if format is defined otherwise we set it undefined
        if ((song.hasOwnProperty("format")) && (song["format"].length > 0)) {
          let formatArray = song["format"];
          let format = {};
          let i = 0;
          formatArray.forEach(f => {
            format[i] = f;
            i++;
          });
          songObj["format"] = format;
        }
        else {
          songObj["format"] = undefined;
        }

        // We verify if "language" isn't undefined, if it is we take "language_detect" instead
        if (song["language"] == "") {
          if (song["language_detect"] != undefined) {
            songObj.language = song["language_detect"];
          }
        }
        else {
          songObj.language = song["language"];
        }

        //this.dataObj["song"+index] = songObj;
        this.dataObj[index] = songObj;
        index++;
      });
    });

    //console.log("dataObj -> ")
    //console.log(this.dataObj);
  }

  public convertLengthToInt(): void {
    this.dataObjInt = this.dataObj;
    for (let i = 1; i <= Object.keys(this.dataObjInt).length - 1; i++) {
      if (this.dataObjInt[i].length != undefined) {
        this.dataObjInt[i].length = parseInt(this.dataObjInt[i].length);
      }
    }
  }

  public getSongs(obj: object) {
    let songs = {};

    for (let i = 1; i < Object.keys(obj).length; i++) {
      songs[i] = obj[i];
    }
    return songs;
  }

  public getDataPhaseA(obj: object) {
    let songs = this.getSongs(obj);
    let songsA = [];

    Object.keys(songs).forEach(index => {
      let song = {};

      song["title"] = songs[index]["title"];

      if (songs[index]["language"] != undefined) {
        song["language"] = songs[index]["language"];
      }
      else {
        song["language"] = "undefined";
      }

      if (songs[index]["length"] != undefined) {
        song["length"] = songs[index]["length"];
      }
      else {
        song["length"] = 0;
      }

      if (songs[index]["format"]) {
        song["format"] = songs[index]["format"][0];
      }
      else {
        song["format"] = "undefined";
      }

      if (songs[index]["genre"]) {
        song["genre"] = songs[index]["genre"][0];
      }
      else {
        song["genre"] = "undefined";
      }

      song["isClassic"] = songs[index]["isClassic"];
      if (songs[index]["isClassic"] == true) {
        song["isClassic"] = "true"
      }
      else {
        song["isClassic"] = "false"
      }
      songsA.push(song);
    })
    return songsA;
  }

  public getDataPhaseB(obj: object) {
    let songs = this.getSongs(obj);
    let songsB = [];

    console.log(songs);

    Object.keys(songs).forEach(index => {
      let song = {};
      let choice;
      let nbGenre;
      let nbFormat;

      // Choose a type of how to treat data
      if ((songs[index]["genre"] != undefined) && (songs[index]["format"] != undefined)) {
        nbGenre = Object.keys(songs[index]["genre"]).length;
        nbFormat = Object.keys(songs[index]["format"]).length;

        if (nbGenre != 0 && nbFormat != 0) {
          choice = "format&genre";
        }
        else choice = "check";
      }

      else choice = "undefined detected";

      song["title"] = songs[index]["title"];
      //song["id"] = songs[index]["id"];

      song["language"] = songs[index]["language"] != undefined ? songs[index]["language"] : "undefined";
      song["length"] = songs[index]["length"] != undefined ? songs[index]["length"].toString() : "undefined";

      song["isClassic"] = songs[index]["isClassic"];

      if (choice == "format&genre") {
        for (let i = 0; i < nbFormat; i++) {
          for (let j = 0; j < nbGenre; j++) {
            let songDuplicate = { ...song };
            songDuplicate["format"] = songs[index]["format"][i];
            songDuplicate["genre"] = songs[index]["genre"][j];
            songsB.push(songDuplicate);
          }
        }
      }

      else if (choice == "equal") {
        for (let i = 0; i < nbFormat; i++) {
          let songDuplicate = { ...song };

          songDuplicate["format"] = songs[index]["format"][i];
          songDuplicate["genre"] = songs[index]["genre"][i];

          songsB.push(songDuplicate);
        }
      }
      else if (choice == "check") {
        if (nbGenre != 0) {
          for (let i = 0; i < nbGenre; i++) {
            let songDuplicate = { ...song };

            songDuplicate["format"] = "undefined";
            songDuplicate["genre"] = songs[index]["genre"][i];

            songsB.push(songDuplicate);

          }
        }
        else if (nbFormat != 0) {
          for (let i = 0; i < nbFormat; i++) {
            let songDuplicate = { ...song };

            songDuplicate["format"] = songs[index]["format"][i];
            songDuplicate["genre"] = "undefined";

            songsB.push(songDuplicate);
          }
        }
        else {
          song["format"] = "undefined";
          song["genre"] = "undefined";

          songsB.push(song);
        }
      }
      else if (choice == "undefined detected") {
        if ((songs[index]["genre"] == undefined) && (songs[index]["format"] != undefined)) {
          nbFormat = Object.keys(songs[index]["format"]).length;
          for (let i = 0; i < nbFormat; i++) {
            let songDuplicate = { ...song };

            songDuplicate["format"] = songs[index]["format"][i];
            songDuplicate["genre"] = "undefined";

            songsB.push(songDuplicate);
          }
        }
        else if ((songs[index]["format"] == undefined) && (songs[index]["genre"] != undefined)) {
          nbGenre = Object.keys(songs[index]["genre"]).length;
          for (let i = 0; i < nbGenre; i++) {
            let songDuplicate = { ...song }; // copy of object and not of reference !

            songDuplicate["format"] = "undefined";
            songDuplicate["genre"] = songs[index]["genre"][i];

            songsB.push(songDuplicate);
          }
        }
        else {
          song["format"] = "undefined";
          song["genre"] = "undefined";

          songsB.push(song);
        }
      }
    })
    console.log("songsB -> ");
    console.table(songsB);
    return songsB;
  }

  // Not functionnal for inside objects yet !
  public printAttributeValues(obj: object, attribute: string): string {
    let value = "";
    Object.keys(obj).forEach(index => {
      // index is 1 2 3 ect here so the index ! It's not an object !

      //console.log(obj[index][attribute])

      // A way to deal with reading undefined as an object ?
      if (obj[index][attribute] != undefined) {
        if (Object.keys(obj[index][attribute]).length <= 1) {
          Object.keys(obj[index][attribute]).forEach(e => {
            value = value + e + " - ";
          });
        }
        else {
          value = value + obj[index][attribute] + " - ";
        }
      }
      else {
        value = value + obj[index][attribute] + " - ";
      }

      /*
      // A bad way to deal with reading undefined as an object ?
      try {
        if(Object.keys(obj[index][attribute]).length <= 1) {
          Object.keys(obj[index][attribute]).forEach(e => {
            value = value + e + " - ";
          });
        }
        else {
          value = value + obj[index][attribute] + " - ";
        }
      } 
      
      catch(error) {
        value = value + obj[index][attribute] + " - ";
      }

      if(Object.keys(obj[index][attribute]) == undefined) {
        value = value + obj[index][attribute] + " - ";
      }
      else {
        value = value + obj[index][attribute] + " - ";
      }*/
    })
    return value
  }


  render() {
    return (
      <Host>
        <h1>Artist/Group Name</h1> 
        {this.dataObj.artist}
        <h1>Song List</h1> 
        {this.printAttributeValues(this.getSongs(this.dataObj), "title")}
        <h1>Languages</h1> 
        {this.printAttributeValues(this.getSongs(this.dataObj), "language")}
        <h1>Genres</h1> 
       
        <br/><br/><br/>
        <h1>Raw JSON</h1> 
      </Host>
    );
  }

}
