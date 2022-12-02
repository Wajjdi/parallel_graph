import { Element, Component, Host, Prop, h, State } from '@stencil/core';
import { select } from 'd3-selection';
import * as d3 from "d3";
//import * as Song from "./Song";

@Component({
  tag: 'parallel-graph',
  styleUrl: 'parallel-graph.css',
  shadow: true
})
export class MyComponent {
  @Element() element: HTMLElement;
  @Prop() width: number = 2000;
  @Prop() height: number = 1000;
  @Prop() data: string = "[]";

  @State() newArtist: string;
  @State() currentArtist: string;


  // Constain valuable information to use in the parallel graph
  @State() dataObj = { artist: "" };
  @State() dataObjInt;
  @State() svg;
  @State() data1;
  @State() dimensions;
  @State() categories;
  @State() group;
  @State() dropdownButton;
  public chartData: any;

  componentDidLoad() {
    /*
    // Test data 
    let tabFormat = ["fa","fb","fc","fd","fe"];
    let tabGenre = ["ga","gb","gc","gd"];
    let testData = {"artist": "testArtist", 1: {"format": tabFormat, "genre": tabGenre, "id": "1", "isClassic": false, 
    "language": "eng", "length": "200", "title": "test"}};
    
    this.getDataPhaseB(testData);*/
    this.currentArtist = "Queen";
    this.analyseData(this.currentArtist);
    console.log(this.dataObj)
    //this.element.shadowRoot.querySelectorAll(".tool")[0].innerHTML = '<svg class="chart" />';
    this.svg = select(this.element.shadowRoot.querySelectorAll(".chart")[0])
    this.group = this.svg.append("g").attr("id", "chartgroup");
    this.dropdownButton = select(this.element.shadowRoot.querySelectorAll(".add")[0])
      .append('div').attr("class", "add2");
    // Extract the list of this.dimensions we want to keep in the plot. Here I keep all except the column called Species
    this.data1 = this.getDataPhaseB(this.dataObj);
    this.dimensions = Object.keys(this.data1[0]).filter(function (d) { return d != "id" })
    this.categories = Object.keys(this.data1[0]);
    // await this.updateData();
    console.log(this.data1)
    this.loadGraph();
  }
  private async updateData() {
    console.log("je suis la")
    console.log(this.dataObj)
    this.data1 = this.getDataPhaseB(this.dataObj);
    this.dimensions = Object.keys(this.data1[0]).filter(function (d) { return d != "id" })
    this.categories = Object.keys(this.data1[0]);
  }
  //------------------------------------- BASE DE DONNEES ----------------------------------------//
  private httpGet(url: string): string {
    let xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", url, false);
    xmlHttpReq.send(null);
    if (xmlHttpReq.status == 200) {
      return xmlHttpReq.responseText;
    }
    else {
      return xmlHttpReq.status.toString();
    }
  }
  private getData(artist: string): string {
    try {
      let data = this.httpGet("https://wasabi.i3s.unice.fr/api/v1/artist_all/name/" + artist)
      return data;
    }
    catch (e) {
      alert("Data not received due to : " + e);
    }
  }

  private loadGraph() {
    this.group.remove()
    this.data1 = this.getDataPhaseB(this.dataObj);
    this.dropdownButton.remove()
    this.dropdownButton = select(this.element.shadowRoot.querySelectorAll(".add")[0]).append('div').attr("class", "add2").append("select");
    let divT = select(this.element.shadowRoot.querySelectorAll(".tool")[0])
    this.svg = select(this.element.shadowRoot.querySelectorAll(".chart")[0])
      .attr("width", this.width)
      .attr("height", this.height);
    console.log(this.svg)
    this.group = this.svg.append("g").attr("id", "chartgroup");
    this.buildParalleGraph(divT, this.dropdownButton);

  }

  private changeArtistName(artistName) {

    //this.element.shadowRoot.querySelectorAll(".tool")[0].innerHTML = "loading...";
    this.analyseData(artistName);
    this.loadGraph();
  }

  private handleSubmit(event: Event) {
    event.preventDefault();
    this.currentArtist = this.newArtist;
    this.changeArtistName(this.currentArtist);
  }

  private handleChange(event) {
    this.newArtist = event.target.value;
    // TODO: Should load there a list of artist which names are like the one typed

  }

  private analyseData(artist: string) {

    let json;

    if (this.getData(artist) == "404") {
      this.element.shadowRoot.querySelectorAll(".log")[0].setAttribute("style", "color: orange");
      this.element.shadowRoot.querySelectorAll(".log")[0].innerHTML = "Artist name not found on Wasabi.";
      console.log("Artist name not found on Wasabi.");
      return null;
    }
    else if (this.getData(artist) == "429") {
      this.element.shadowRoot.querySelectorAll(".log")[0].setAttribute("style", "color: red");
      this.element.shadowRoot.querySelectorAll(".log")[0].innerHTML = "Too many requests on Wasabi.";
      console.log("Too many requests on Wasabi.")
      return null;
    }
    else {
      this.element.shadowRoot.querySelectorAll(".log")[0].setAttribute("style", "color: green");
      this.element.shadowRoot.querySelectorAll(".log")[0].innerHTML = "Request OK.";
      console.log("Request OK.");

      json = JSON.parse(this.getData(artist));
    }

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
          if (song["language_detect"] != "") {
            songObj.language = song["language_detect"];
          }
          else {
            songObj.language = "empty";
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
  }

  private getSongs(obj: object) {
    let songs = {};

    for (let i = 1; i < Object.keys(obj).length; i++) {
      songs[i] = obj[i];
    }
    return songs;
  }

  private getDataPhaseA(obj: object) {
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

  private getDataPhaseB(obj: object) {
    let songs = this.getSongs(obj);
    let songsB = [];

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


      song["id"] = songs[index]["id"];
      song["title"] = songs[index]["title"];

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
    console.table(songsB);
    return songsB;
  }

 


  // Not functionnal for inside objects yet !
  private printAttributeValues(obj: object, attribute: string): string {
    let value = "";
    Object.keys(obj).forEach(index => {
      // index is 1 2 3 ect here so the index ! It's not an object !

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

  //-------------------------------------- CREATION DU DIAGRAMME ------------------------------------------------------//
  private updateDimension(name) {
    this.group.remove()
    this.dropdownButton.remove()
    this.dropdownButton = select(this.element.shadowRoot.querySelectorAll(".add")[0])
      .append('div').attr("class", "add2");
    this.dimensions.push(name);
    this.loadGraph();
  }
  buildParalleGraph(divT, dropdownButton) {

    var margin = { top: 10, right: 10, bottom: 10, left: 0 },
      width = 1900 - margin.left - margin.right,
      height = 1000 - margin.top - margin.bottom;


    var allGroup = ["", "id"]
    // Initialize the button
    // add the options to the button
    this.dropdownButton // Add a button
      .selectAll('myOptions') // Next 4 lines add 6 options = 6 colors
      .data(allGroup)
      .enter()
      .append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; })

    const self = this
    // When the button is changed, run the updateChart function
    this.dropdownButton.on("change", function (d) {
      // recover the option that has been chosen
      var selectedOption = d3.select(this).property("value")

      // run the updateChart function with this selected option
      if (!self.dimensions.includes(selectedOption) && selectedOption != "") {
        self.updateDimension(selectedOption)
        console.log(self.dimensions)
      }
    })

    // For each dimension, I build a linear scale. I store all in a y object
    const y = {}

    console.log(this.data1)
    var val = Object.values(this.data1[1]);
    //console.log("this.data1 10 : " , this.data1[1].length);

    var valStr = val.toString();

    //console.log("type of value : " + typeof val);


    const title = [];
    let longueur = [];
    const format = [];
    const genre = [];
    const isClassic = [];
    const language = []
    const id = []


    for (var t = 0; t < this.data1.length; t++) {

      longueur.push(this.data1[t].length)
      title.push(this.data1[t].title)
      format.push(this.data1[t].format)
      genre.push(this.data1[t].genre)
      isClassic.push(this.data1[t].isClassic)
      language.push(this.data1[t].language)
      id.push(this.data1[t].id)
    }



    //à remplacer par 
    //où servent les array title etc?
    for (var t = 0; t < this.data1.length; t++) {
      this.categories.forEach(cat => {
        Array.from(cat).push(this.data1[t].cat);
      });
    }

    // ordre croissant
    let bonneLongueur = longueur.filter(d => d != "undefined");
    bonneLongueur.sort((a, b) => +b - (+a));

    bonneLongueur.splice(0, 0, "undefined");
    longueur = bonneLongueur;
    //--------------------------------------------//
    for (var i in this.dimensions) {

      var j = 0;
      const name = this.dimensions[i];
      console.log("name : " + name);
      if (name == "length") {
        y[name] = d3.scalePoint()// scale point
          .domain(longueur)
          .range([height, 20])
      }
      else if (name == "title") {
        y[name] = d3.scalePoint()// scale point
          .domain(title) // 
          .range([height, 20])
      }
      else if (name == "format") {
        y[name] = d3.scalePoint()// scale point
          .domain(format) // 
          .range([height, 20])
      }
      else if (name == "genre") {
        y[name] = d3.scalePoint()// scale point
          .domain(genre) // 
          .range([height, 20])
      }
      else if (name == "isClassic") {

        y[name] = d3.scalePoint()// scale point
          .domain(isClassic) // 
          .range([height, 20])
      }
      else if (name == "id") {
        y[name] = d3.scalePoint()// scale point
          .domain(id) // 
          .range([height, 20])
      }
      else {
        y[name] = d3.scalePoint()// scale point
          .domain(language) // 
          .range([height, 20])
      }


      /*  
  // à remplacer par : 
        y[name] = d3.scalePoint()// scale point
        .domain(name)
        .range([height, 20])
        
    console.log( "y[name] :  " + y[name] );
   */

    }

    // Build the X scale -> it find the best position for each Y axis
    const x = d3.scalePoint()
      .range([0, width])
      .padding(1)
      .domain(this.dimensions);

    function addslashes(ch) {
      ch = "a" + ch
      ch = ch.replace(/\s+/g, '')
      ch = ch.replace(/['"]+/g, '')
      ch = ch.replace(/[^\w\s!?]/g, '')
      ch = ch.replace(/\?/g, '')
      return ch.toLowerCase()
    }
    //-------------------Tooltip --------------------------//


    var Tooltip = divT.append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "#70bead")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
    var mousemove = function (event, d) {
      let tmptitle = [];
      //probablement retirable
      let tmplong = [];
      for (var t = 0; t < self.data1.length; t++) {
        if (d == self.data1[t].title) {
          tmptitle.push(self.data1[t].title)
          if (!tmplong.includes(self.data1[t].length)) {
            //récupere la longeur 
            tmplong.push(self.data1[t].length)
          }
        }
      }

      if (tmptitle.includes(d)) {
        //récupères l'id à partir du titre pour connaitre les valeurs à mettre en avant sur les axes en y et ajouter les infos dans la tooltip
        var selectedArray = [];
        var NewselectedArray = [];

        // si le titre match on reecuperes les données dans selected
        //this.data1.forEach(function (value) { if(value.title==d){ if(selected==null){selected = value;} else{selected2 = value; }}});

        self.data1.forEach(function (value) { if (value.title == d) { selectedArray.push(value); } });

        NewselectedArray.push(selectedArray[0]);
        var tempID = selectedArray[0].id;

        //fusionne les songs aux id similaires (a check?) pour garder toutes les valeurs de chaque propriété
        //TODO: merge songs : nous avons des songs différentes qui sont en réalité la même (même id) cra les données ne contiennent qu'une valeur par catégorie
        // reste à fix la classe song 
        /*
        var mergedSong = new Song("","","",null,null,"","");
        selectedArray.forEach(song => {
          mergedSong = mergedSong.mergeSongs(mergedSong,song);


        });
        
        selectedArray = [""];
        selectedArray.push(mergedSong);
        */
        selectedArray.forEach(song => {

          if (song.id != tempID) {
            NewselectedArray.push(song);
            tempID = song.id;
          } else {

            Object.entries(NewselectedArray[0]).forEach(selected => {
              var newselected = selected[0];
              //console.log("selected0 : " + newselected );
              //console.log("meme id, infos diff : " + NewselectedArray[0].newselected + " et " + song.newselected)
              if (NewselectedArray[0].newselected != song.newselected) {
                song.selected += " ," + NewselectedArray[0].newselected;
                NewselectedArray.splice[NewselectedArray.length];
                NewselectedArray.push(song);
              }
            });
          }
        });
        selectedArray = NewselectedArray;

        var HTML = "";
        var firstSong = true;
        // fusionner id differents 
        // console.log("selectedArray : " + selectedArray[0]);


        selectedArray.forEach(selected => {

      

          var NombreCategories = Object.entries(selected).length;
          var separateur = 0;
          var coupleCatVal = "";

          //console.log("NombreCategories : " + NombreCategories);
          Object.entries(selected).forEach(category => {

            if (!firstSong) {
              console.log("firstSong false ");
              if (separateur % NombreCategories == 0) { HTML += "<br> --------------------------<br> "; }
            } else {
              console.log("firstSong true ");
              firstSong = false;
            }
            separateur++;
            coupleCatVal += category[0] + " : " + category[1];
            HTML += coupleCatVal + " <br>";
            coupleCatVal = "";
          })
          console.log("HTML : " + HTML);

        })

        Tooltip
          // titre en gras
          .style("stroke", "black")
          .html(HTML)
          //.html("The tittle is: " + d +  /*"<br>"+"number of id : "+tmplong.length+"<br>"+"first id length : "+tmplong[0] +*/ " <br> language : " + selected.language + "<br> style de musique : " + selected2.id)
          .style("left", (event.pageX - 240) + "px")
          .style("top", (event.pageY + 20) + "px")
          .style("position", "absolute")


      }
    }
    const mouseover = function (event, d) {


      // verifier si c'est un chiffre si c'est un chiffre return
      const selected_title = addslashes(d)
      // first every group turns grey
      self.group.selectAll(".line")
        .style("stroke", "#69b3a2")
        .style("opacity", "0.1")
        .style("stroke-width", "0.7px")
      // Second the hovered title takes its red
      self.group.selectAll("." + selected_title)
        .style("stroke", "#FF0000")
        .style("opacity", "1")
        .style("stroke-width", "3px")
      for (var t = 0; t < self.data1.length; t++) {
        if (d == self.data1[t].title) {
          Tooltip
            .style("opacity", 1)
        }
      }
      d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1)

    }
    const mouseleave = function (event) {
      self.group.selectAll(".line")
        .style("stroke", "#69b3a2")
        .style("opacity", "1")
        .style("stroke-width", "0.7px")
      Tooltip
        .style("opacity", 0)
      d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8)
    }
    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
      return d3.line()(self.dimensions.map(function (p) { return [x(p), y[p](d[p])]; }));
    }
    // Draw the lines
    console.log(this.data1)
    this.group
      .selectAll("myPath")
      .data(this.data1)
      .join("path")
      .attr("class", function (d) { return "line " + addslashes(d.title) + " " + addslashes(d.language) + " " + addslashes(d.format) + " " + addslashes(d.genre) + " " + addslashes(d.length) + " " + addslashes(d.isClassic) })
      .attr("d", path)
      .style("fill", "none")
      .style("stroke", "#69b3a2")
      .style("opacity", 0.5)

    // Draw the axis:

    this.group.selectAll("myAxis")
      // For each dimension of the dataset I add a 'g' element:
      .data(this.dimensions).enter()
      //TODO: trier liste this.dimensions selon l'ordre visuel désiré
      .append("g")
      //TODO:  voir comment marche join et remplacer append par join où necessaire (réaffichage dynamique de la page)
      // I translate this element to its right position on the x axis
      .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
      // And I build the axis with the call function
      .each(function (d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d])).selectAll(".tick text").on("mouseover", mouseover).on("mousemove", mousemove).on("mouseleave", mouseleave); })
      // Add axis title

      .append("text")
      .style("text-anchor", "middle")
      .attr("y", 10)
      .text(function (d) { console.log(d); return d; })
      .style("fill", "black")
    // .append('select')
    // .selectAll('myOptions') // Next 4 lines add 6 options = 6 colors
    // .data(this.dimensions)
    // .attr("y", 10)
    // .enter()
    // .append('option')
    // .text(function (d) { return d; }) // text showed in the menu
    // .attr("value", function (d) { return d; })




  }

  // used https://stenciljs.com/docs/forms for form

  render() {
    return (
      <Host>
        <div class="search-zone">
          <h1>Parallel graph</h1>

          <form onSubmit={(e) => this.handleSubmit(e)}>
            <label>
              Search artist name:  <input class="input-search" type="text" value={this.newArtist} onInput={(event) => this.handleChange(event)} />
            </label>
            <input type="submit" value="Search" />
          </form>
          <div class="log"> No problems </div>
          <div class="current-artist" >Current artist : {this.currentArtist}</div>
          <h2>Stats (TODO) </h2>
          <p>Missing data : </p>
        </div>

        <div class="tool">
          <svg class="chart" />

        </div>
        <div class="add">
        </div>
      </Host>
    )
  }
}
