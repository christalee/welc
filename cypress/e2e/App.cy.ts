describe("WeLC", () => {
  describe("Playlist tab", () => {
    it("displays a filepicker", () => {
      cy.visit("http://localhost:5174/");
      cy.get("[data-test='fileInput']").should("exist");
    });

    it("allows the user to select a file and displays/plays the result", () => {
      cy.visit("http://localhost:5174/");
      // Before you select a file, the audio element and playlist should not exist
      cy.get("[data-test='audio']").should("not.exist");
      cy.get("[data-test='playlistFiles']").should("not.exist");

      cy.get("[data-test='fileInput']").selectFile(
        "cypress/fixtures/audio1.mp3",
        { force: true },
      );
      cy.wait(1000);

      // Now audio should play and the filename/metadata should appear
      cy.get("[data-test='audio']")
        .should("exist")
        .should("have.prop", "paused")
        .then((paused) => expect(paused).to.be.false);
      cy.get("[data-test='playlistFiles']>li")
        .contains("audio1.mp3")
        .should("exist");
      const expectedMetadata = [
        "Title: Track 1",
        "Artist: Lorem Ipsum",
        "Album: Dolor Sit Amet",
        "Track #: 1",
      ];
      cy.get("[data-test='metadata']>li").then((elements) => {
        const actualMetadata = [...elements].map((li) => li.innerText.trim());
        expect(actualMetadata).to.deep.equal(expectedMetadata);
      });
    });

    it("allows the user to select multiple files and click on one to play it", () => {
      cy.visit("http://localhost:5174/");
      cy.get("[data-test='fileInput']").selectFile(
        [
          "cypress/fixtures/audio1.mp3",
          "cypress/fixtures/audio2.mp3",
          "cypress/fixtures/audio3.mp3",
        ],
        { force: true },
      );
      cy.wait(500);

      const expectedPlaylist = ["audio1.mp3", "audio2.mp3", "audio3.mp3"];
      cy.get("[data-test='playlistFiles']>li").then((elements) => {
        const actualPlaylist = [...elements].map((li) => li.innerText.trim());
        expect(actualPlaylist).to.deep.equal(expectedPlaylist);
      });

      // Click on track 3
      cy.get("[data-test='playlistFiles']>li").contains("audio3.mp3").click();
      cy.wait(1000);

      // Track 3 should play and tracks 1 and 2 should not appear anymore
      const newPlaylist = ["audio3.mp3"];
      cy.get("[data-test='playlistFiles']>li").then((elements) => {
        const actualPlaylist = [...elements].map((li) => li.innerText.trim());
        expect(actualPlaylist).to.deep.equal(newPlaylist);
      });
      const expectedMetadata = [
        "Title: Track 3",
        "Artist: Lorem Ipsum",
        "Album: Dolor Sit Amet",
        "Track #: 3",
      ];
      cy.get("[data-test='metadata']>li").then((elements) => {
        const actualMetadata = [...elements].map((li) => li.innerText.trim());
        expect(actualMetadata).to.deep.equal(expectedMetadata);
      });
    });

    it("sorts input by filename on upload", () => {
      cy.visit("http://localhost:5174/");
      cy.get("[data-test='fileInput']").selectFile(
        [
          "cypress/fixtures/audio3.mp3",
          "cypress/fixtures/audio2.mp3",
          "cypress/fixtures/audio1.mp3",
        ],
        { force: true },
      );
      cy.wait(500);

      const expectedPlaylist = ["audio1.mp3", "audio2.mp3", "audio3.mp3"];
      cy.get("[data-test='playlistFiles']>li").then((elements) => {
        const actualPlaylist = [...elements].map((li) => li.innerText.trim());
        expect(actualPlaylist).to.deep.equal(expectedPlaylist);
      });
    });

    it("appends subsequently selected files to the end of the playlist", () => {
      cy.visit("http://localhost:5174/");
      cy.get("[data-test='fileInput']").selectFile(
        "cypress/fixtures/audio1.mp3",
        { force: true },
      );

      cy.get("[data-test='playlistFiles']>li")
        .contains("audio1.mp3")
        .should("exist");
      cy.get("[data-test='playlistFiles']>li")
        .contains("audio2.mp3")
        .should("not.exist");

      cy.get("[data-test='fileInput']").selectFile(
        "cypress/fixtures/audio2.mp3",
        { force: true },
      );

      const expectedPlaylist = ["audio1.mp3", "audio2.mp3"];
      cy.get("[data-test='playlistFiles']>li").then((elements) => {
        const actualPlaylist = [...elements].map((li) => li.innerText.trim());
        expect(actualPlaylist).to.deep.equal(expectedPlaylist);
      });
    });

    // SKIP cypress doesn't recognize the directory input functionality
    // it("allows the user to select a directory and play all the audio files in it", () => {
    //   cy.visit("http://localhost:5174/");
    //   cy.get("[data-test='directoryInput']").selectFile("cypress/fixtures");
    //   cy.wait(500);

    //   cy.get("[data-test='playlist']>li").then((elements) => {
    //     const actualPlaylist = [...elements].map((li) => li.innerText.trim());
    //     // can't predict the ordering
    //     expect(actualPlaylist).to.include("audio1.mp3");
    //     expect(actualPlaylist).to.include("audio2.mp3");
    //     expect(actualPlaylist).to.include("audio3.mp3");
    //   });
    // });

    it("plays the next track after the first track is finished", () => {
      cy.visit("http://localhost:5174/");
      cy.get("[data-test='fileInput']").selectFile(
        [
          "cypress/fixtures/audio1.mp3",
          "cypress/fixtures/audio2.mp3",
          "cypress/fixtures/audio3.mp3",
        ],
        { force: true },
      );
      cy.get("[data-test='audio']").then((audioEl) => {
        const audio = audioEl[0] as HTMLAudioElement;
        audio.currentTime = 166; // audio1.mp3 is 2:47s
        cy.wait(5000);
      });

      const newPlaylist = ["audio2.mp3", "audio3.mp3"];
      cy.get("[data-test='playlistFiles']>li").then((elements) => {
        const actualPlaylist = [...elements].map((li) => li.innerText.trim());
        expect(actualPlaylist).to.deep.equal(newPlaylist);
      });
      const expectedMetadata = [
        "Title: Track 2",
        "Artist: Lorem Ipsum",
        "Album: Dolor Sit Amet",
        "Track #: 2",
      ];
      cy.get("[data-test='metadata']>li").then((elements) => {
        const actualMetadata = [...elements].map((li) => li.innerText.trim());
        expect(actualMetadata).to.deep.equal(expectedMetadata);
      });
    });

    it("resets the app when the end of the last file is reached", () => {
      cy.visit("http://localhost:5174/");
      cy.get("[data-test='fileInput']").selectFile(
        "cypress/fixtures/audio1.mp3",
        { force: true },
      );

      // after playing to the end of the file, the audio element should disappear
      // and the metadata and playlist should clear
      const audioEl = cy.get("[data-test='audio']");
      audioEl.then((audioEl) => {
        const audio = audioEl[0] as HTMLAudioElement;
        audio.currentTime = 166; // audio1.mp3 is 2:47s
        cy.wait(2000);
      });

      audioEl.should("not.exist");
      cy.get("[data-test='metadata']>li").should("have.length", 0);
      cy.get("[data-test='playlistFiles']").should("not.exist");
    });

    it("sorts the playlist in ascending order by default upon upload", () => {
      cy.visit("http://localhost:5174/");
      cy.get("[data-test='fileInput']").selectFile(
        [
          "cypress/fixtures/audio3.mp3",
          "cypress/fixtures/audio2.mp3",
          "cypress/fixtures/audio1.mp3",
        ],
        { force: true },
      );

      const expectedPlaylist = ["audio1.mp3", "audio2.mp3", "audio3.mp3"];
      cy.get("[data-test='playlistFiles']>li").then((elements) => {
        const actualPlaylist = [...elements].map((li) => li.innerText.trim());
        expect(actualPlaylist).to.deep.equal(expectedPlaylist);
      });
    });

    it("sorts the playlist in descending/ascending order when the sort buttons are clicked", () => {
      cy.visit("http://localhost:5174/");
      cy.get("[data-test='fileInput']").selectFile(
        [
          "cypress/fixtures/audio3.mp3",
          "cypress/fixtures/audio2.mp3",
          "cypress/fixtures/audio1.mp3",
        ],
        { force: true },
      );

      // same behavior as previous test, in case that test changes
      const expectedPlaylist = ["audio1.mp3", "audio2.mp3", "audio3.mp3"];
      cy.get("[data-test='playlistFiles']>li").then((elements) => {
        const actualPlaylist = [...elements].map((li) => li.innerText.trim());
        expect(actualPlaylist).to.deep.equal(expectedPlaylist);
      });

      // first sort desc to change the order
      cy.get("[data-test='sortDesc']").click();
      const descPlaylist = ["audio3.mp3", "audio2.mp3", "audio1.mp3"];
      cy.get("[data-test='playlistFiles']>li").then((elements) => {
        const actualPlaylist = [...elements].map((li) => li.innerText.trim());
        expect(actualPlaylist).to.deep.equal(descPlaylist);
      });

      // then sort asc to change the order
      cy.get("[data-test='sortAsc']").click();
      const ascPlaylist = ["audio1.mp3", "audio2.mp3", "audio3.mp3"];
      cy.get("[data-test='playlistFiles']>li").then((elements) => {
        const actualPlaylist = [...elements].map((li) => li.innerText.trim());
        expect(actualPlaylist).to.deep.equal(ascPlaylist);
      });
    });

    it("shuffles the playlist when the shuffle button is clicked", () => {
      cy.visit("http://localhost:5174/");
      cy.get("[data-test='fileInput']").selectFile(
        [
          "cypress/fixtures/audio3.mp3",
          "cypress/fixtures/audio2.mp3",
          "cypress/fixtures/audio1.mp3",
          "cypress/fixtures/audio3.mp3",
          "cypress/fixtures/audio2.mp3",
          "cypress/fixtures/audio1.mp3",
        ],
        { force: true },
      );

      // same behavior as previous test, in case that test changes
      const initialPlaylist = [
        "audio1.mp3",
        "audio1.mp3",
        "audio2.mp3",
        "audio2.mp3",
        "audio3.mp3",
        "audio3.mp3",
      ];
      cy.get("[data-test='playlistFiles']>li").then((elements) => {
        const actualPlaylist = [...elements].map((li) => li.innerText.trim());
        expect(actualPlaylist).to.deep.equal(initialPlaylist);
      });

      const shuffle = cy.get("[data-test='shuffle']");
      shuffle.click();
      cy.get("[data-test='playlistFiles']>li").then((elements) => {
        const actualPlaylist = [...elements].map((li) => li.innerText.trim());
        // if shuffle returns elements in the same order as before, try again;
        // shouldn't collide very often with 6 files
        while (
          actualPlaylist.every(
            (value, index) => value === initialPlaylist[index],
          )
        ) {
          shuffle.click();
        }
        expect(actualPlaylist).to.not.deep.equal(initialPlaylist);
      });
    });

    it("clears the playlist when the trash button is clicked", () => {
      cy.visit("http://localhost:5174/");
      cy.get("[data-test='fileInput']").selectFile(
        [
          "cypress/fixtures/audio3.mp3",
          "cypress/fixtures/audio2.mp3",
          "cypress/fixtures/audio1.mp3",
        ],
        { force: true },
      );

      // same behavior as previous test, in case that test changes
      const expectedPlaylist = ["audio1.mp3", "audio2.mp3", "audio3.mp3"];
      cy.get("[data-test='playlistFiles']>li").then((elements) => {
        const actualPlaylist = [...elements].map((li) => li.innerText.trim());
        expect(actualPlaylist).to.deep.equal(expectedPlaylist);
      });

      cy.get("[data-test='trash']").click();
      cy.get("[data-test='playlistFiles']").should("not.exist");
    });
  });

  describe("Library tab", () => {
    beforeEach(() => {
      // Clear table before testing
      cy.task("queryDb", "TRUNCATE music;");
    });

    it("shows no files before the directory has been scanned", () => {
      cy.visit("http://localhost:5174/");
      const libraryTab = cy.get("[data-test='library']");
      libraryTab.click();

      cy.get("[data-test='libraryData']>li").should("not.exist");

      const libraryPathField = cy.get("[data-test='libraryPathField']");
      libraryPathField.type(
        "/Users/christalee/Documents/software/projects/welc/cypress/fixtures",
      );

      cy.get("[data-test='libraryData']>li").should("not.exist");
    });

    it("shows files after the directory is scanned", () => {
      cy.visit("http://localhost:5174/");
      const libraryTab = cy.get("[data-test='library']");
      libraryTab.click();

      const libraryPathField = cy.get("[data-test='libraryPathField']");
      libraryPathField.type(
        "/Users/christalee/Documents/software/projects/welc/cypress/fixtures",
      );
      cy.get("[data-test='libraryData']>li").should("not.exist");

      const scanBtn = cy.get("[data-test='scanLibrary']");
      scanBtn.click();
      cy.wait(1000);

      const expectedLibrary = [
        "file:///Users/christalee/Documents/software/projects/welc/cypress/fixtures/audio1.mp3",
        "file:///Users/christalee/Documents/software/projects/welc/cypress/fixtures/audio2.mp3",
        "file:///Users/christalee/Documents/software/projects/welc/cypress/fixtures/audio3.mp3",
      ];
      cy.get("[data-test='libraryData']>li").then((elements) => {
        const actualLibrary = [...elements].map((li) => li.innerText.trim());
        expect(actualLibrary).to.include.members(expectedLibrary);
      });
    });
    it("shows no files after the directory has been scanned and cleared", () => {
      cy.visit("http://localhost:5174/");
      const libraryTab = cy.get("[data-test='library']");
      libraryTab.click();

      const libraryPathField = cy.get("[data-test='libraryPathField']");
      libraryPathField.type(
        "/Users/christalee/Documents/software/projects/welc/cypress/fixtures",
      );
      cy.get("[data-test='libraryData']>li").should("not.exist");

      const scanBtn = cy.get("[data-test='scanLibrary']");
      scanBtn.click();
      cy.wait(1000);

      const expectedLibrary = [
        "file:///Users/christalee/Documents/software/projects/welc/cypress/fixtures/audio1.mp3",
        "file:///Users/christalee/Documents/software/projects/welc/cypress/fixtures/audio2.mp3",
        "file:///Users/christalee/Documents/software/projects/welc/cypress/fixtures/audio3.mp3",
      ];
      cy.get("[data-test='libraryData']>li").then((elements) => {
        const actualLibrary = [...elements].map((li) => li.innerText.trim());
        expect(actualLibrary).to.include.members(expectedLibrary);
      });

      const clearBtn = cy.get("[data-test='clearLibrary']");
      clearBtn.click();
      cy.wait(1000);

      cy.get("[data-test='libraryData']>li").should("not.exist");
    });
  });
});
